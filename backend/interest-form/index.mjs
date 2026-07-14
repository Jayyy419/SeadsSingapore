import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { randomUUID, createHmac, timingSafeEqual, scryptSync, randomBytes } from "node:crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});
const secretsManager = new SecretsManagerClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const IMPACT_METRICS_TABLE = process.env.IMPACT_METRICS_TABLE;
const STORY_SUBMISSIONS_TABLE = process.env.STORY_SUBMISSIONS_TABLE;
const ADMIN_CONFIG_TABLE = process.env.ADMIN_CONFIG_TABLE;
const EVENTS_TABLE = process.env.EVENTS_TABLE;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
// Admin auth lives here, not on the Amplify/Next.js side — Amplify Hosting's environment
// variables for this app never reliably reach the deployed SSR compute's process.env at
// request time (confirmed via a temporary diagnostic endpoint; see docs/LEARNING_GUIDE.md),
// despite the app-level config showing correct values and both the service role and compute
// role being properly attached. Lambda's own env vars, by contrast, have worked reliably all
// session via a completely different, well-established mechanism
// (`aws lambda update-function-configuration`). So the Next.js side is now a thin, secret-free
// proxy: it forwards the password to POST /admin-login and forwards the resulting session
// token on every subsequent /internal/* call, and this Lambda does all real verification.
//
// ADMIN_PASSWORD (env var) is only the *bootstrap* value now — the real source of truth is a
// salted/hashed entry in ADMIN_CONFIG_TABLE, lazily migrated on first successful login so
// changing the password later never requires an AWS CLI call again (see handleChangePassword).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  };
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json(statusCode, headers, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

const INTEREST_TYPES = new Set(["volunteer", "partner", "event", "other"]);
const INTEREST_TYPE_LABELS = { volunteer: "Volunteering", partner: "Partnering", event: "Attending an event", other: "Other" };
const LOCALES = ["en", "zh", "ms", "hi"];

// API Gateway's own throttle (5 rps / burst 10) is global across every caller, not per-IP —
// AWS WAF can't attach to HTTP APIs (see docs/LEARNING_GUIDE.md), so this is the per-caller
// backstop instead. Fixed 10-minute buckets stored as ordinary rate-limit items in the same
// table, keyed off the same "id" partition key everything else uses; TTL cleans them up.
const RATE_LIMIT_WINDOW_SECONDS = 600;

async function checkRateLimit(key, limit) {
  const windowStart = Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW_SECONDS) * RATE_LIMIT_WINDOW_SECONDS;
  const itemId = `ratelimit#${key}#${windowStart}`;
  const ttl = windowStart + RATE_LIMIT_WINDOW_SECONDS + 60;

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: itemId },
        UpdateExpression: "SET #ttl = if_not_exists(#ttl, :ttl) ADD #count :incr",
        ExpressionAttributeNames: { "#ttl": "ttl", "#count": "count" },
        ExpressionAttributeValues: { ":ttl": ttl, ":incr": 1 },
        ReturnValues: "UPDATED_NEW",
      })
    );
    return (result.Attributes?.count ?? 0) <= limit;
  } catch (err) {
    // Fails open on our own infra errors, same policy as the Turnstile check below — a
    // DynamoDB blip shouldn't block a legitimate submission.
    console.error("Rate limit check failed:", err);
    return true;
  }
}

// Cached across warm Lambda invocations so we're not calling Secrets Manager on every request.
let cachedTurnstileSecret;
async function getTurnstileSecret() {
  if (cachedTurnstileSecret !== undefined) return cachedTurnstileSecret;
  try {
    const result = await secretsManager.send(new GetSecretValueCommand({ SecretId: "seads/turnstile-secret-key" }));
    cachedTurnstileSecret = result.SecretString || null;
  } catch (err) {
    console.error("Could not load Turnstile secret, skipping bot-check:", err);
    cachedTurnstileSecret = null;
  }
  return cachedTurnstileSecret;
}

// Fails open (allows the submission through) on our own infra errors — a Secrets Manager or
// network blip shouldn't take down the form — but fails closed on an actual failed/missing
// verification, which is the case this exists to catch.
async function verifyTurnstile(token, remoteIp) {
  const secret = await getTurnstileSecret();
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification request failed:", err);
    return true;
  }
}

async function handleSubmitInterest(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 200) : "";
  const email = typeof payload.email === "string" ? payload.email.trim().slice(0, 200) : "";
  const interest = typeof payload.interest === "string" ? payload.interest.trim().slice(0, 1000) : "";
  const interestType = INTEREST_TYPES.has(payload.interestType) ? payload.interestType : "";
  const eventSlug = typeof payload.eventSlug === "string" ? payload.eventSlug.trim().slice(0, 200) : "";

  if (!name || !isValidEmail(email)) {
    return json(400, headers, { error: "name and a valid email are required" });
  }

  const remoteIp = event.requestContext?.http?.sourceIp;
  const [ipOk, emailOk] = await Promise.all([
    remoteIp ? checkRateLimit(`ip#${remoteIp}`, 5) : true,
    checkRateLimit(`email#${email.toLowerCase()}`, 3),
  ]);
  if (!ipOk || !emailOk) {
    return json(429, headers, { error: "Too many submissions — please try again in a few minutes." });
  }

  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
  if (!(await verifyTurnstile(turnstileToken, remoteIp))) {
    return json(400, headers, { error: "Could not verify you're not a bot. Please try again." });
  }

  const submittedAt = new Date().toISOString();
  const id = randomUUID();

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { id, name, email, interest, interestType, submittedAt, ...(eventSlug ? { eventSlug } : {}) },
    })
  );

  if (NOTIFY_EMAIL) {
    const typeLabel = INTEREST_TYPE_LABELS[interestType];
    try {
      await ses.send(
        new SendEmailCommand({
          Source: NOTIFY_EMAIL,
          Destination: { ToAddresses: [NOTIFY_EMAIL] },
          Message: {
            Subject: { Data: `New Seads interest form submission${typeLabel ? ` (${typeLabel})` : ""} from ${name}` },
            Body: {
              Text: {
                Data: `Name: ${name}\nEmail: ${email}\nInterested in: ${typeLabel || "(not specified)"}\nMessage: ${interest || "(none given)"}\nSubmitted: ${submittedAt}`,
              },
            },
          },
        })
      );
    } catch (err) {
      // Don't fail the whole request if the notification email can't be sent (e.g. SES
      // sandbox mode, unverified address) — the submission is already safely in DynamoDB.
      console.error("SES send failed:", err);
    }
  }

  return json(200, headers, { ok: true });
}

async function handleSubmitStory(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const authorName = typeof payload.authorName === "string" ? payload.authorName.trim().slice(0, 200) : "";
  const authorEmail = typeof payload.authorEmail === "string" ? payload.authorEmail.trim().slice(0, 200) : "";
  const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 200) : "";
  const body = typeof payload.body === "string" ? payload.body.trim().slice(0, 5000) : "";

  if (!authorName || !isValidEmail(authorEmail) || !title || !body) {
    return json(400, headers, { error: "authorName, a valid authorEmail, title, and body are required" });
  }

  const remoteIp = event.requestContext?.http?.sourceIp;
  const [ipOk, emailOk] = await Promise.all([
    remoteIp ? checkRateLimit(`ip#story#${remoteIp}`, 5) : true,
    checkRateLimit(`email#story#${authorEmail.toLowerCase()}`, 3),
  ]);
  if (!ipOk || !emailOk) {
    return json(429, headers, { error: "Too many submissions — please try again in a few minutes." });
  }

  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
  if (!(await verifyTurnstile(turnstileToken, remoteIp))) {
    return json(400, headers, { error: "Could not verify you're not a bot. Please try again." });
  }

  const id = randomUUID();
  const submittedAt = new Date().toISOString();

  await ddb.send(
    new PutCommand({
      TableName: STORY_SUBMISSIONS_TABLE,
      Item: { id, authorName, authorEmail, title, body, status: "pending", submittedAt },
    })
  );

  return json(200, headers, { ok: true });
}

function signToken(payload) {
  return createHmac("sha256", ADMIN_SESSION_SECRET).update(payload).digest("hex");
}

function createSessionToken() {
  const expiresAt = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  return `${expiresAt}.${signToken(expiresAt)}`;
}

function isValidSessionToken(token) {
  if (!token || !ADMIN_SESSION_SECRET) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = signToken(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return Number.isFinite(Number(payload)) && Date.now() < Number(payload);
}

function requireValidAdminToken(event) {
  const provided = event.headers?.["x-admin-token"] || event.headers?.["X-Admin-Token"];
  return isValidSessionToken(provided);
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

async function getStoredPasswordConfig() {
  const result = await ddb.send(new GetCommand({ TableName: ADMIN_CONFIG_TABLE, Key: { configId: "password" } }));
  return result.Item ?? null;
}

async function storePassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  await ddb.send(
    new PutCommand({
      TableName: ADMIN_CONFIG_TABLE,
      Item: { configId: "password", salt, hash, updatedAt: new Date().toISOString() },
    })
  );
}

// The DynamoDB-stored hash is the real source of truth once it exists; ADMIN_PASSWORD (the
// Lambda env var) is only the bootstrap value, checked and auto-migrated on first successful
// login so that changing the password afterward never needs an AWS CLI call again.
async function checkPassword(password) {
  if (!password) return false;

  const stored = await getStoredPasswordConfig();
  if (stored) {
    const expected = Buffer.from(stored.hash, "hex");
    const actual = Buffer.from(hashPassword(password, stored.salt), "hex");
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  if (ADMIN_PASSWORD && password === ADMIN_PASSWORD.trim()) {
    await storePassword(password);
    return true;
  }
  return false;
}

async function handleAdminLogin(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const password = typeof payload.password === "string" ? payload.password.trim() : "";
  if (!(await checkPassword(password))) {
    return json(401, headers, { ok: false, error: "Incorrect password" });
  }

  return json(200, headers, { ok: true, token: createSessionToken() });
}

async function handleChangePassword(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const currentPassword = typeof payload.currentPassword === "string" ? payload.currentPassword.trim() : "";
  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword.trim() : "";

  if (!(await checkPassword(currentPassword))) {
    return json(401, headers, { ok: false, error: "Current password is incorrect" });
  }
  if (newPassword.length < 8) {
    return json(400, headers, { ok: false, error: "New password must be at least 8 characters" });
  }

  await storePassword(newPassword);
  return json(200, headers, { ok: true });
}

async function handleVerifySession(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  return json(200, headers, { valid: isValidSessionToken(payload?.token) });
}

async function handleGetImpactMetrics(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: IMPACT_METRICS_TABLE }));
  const items = (result.Items || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return json(200, headers, { metrics: items });
}

async function handleUpdateImpactMetric(event, headers, metricId) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const existing = await ddb.send(new GetCommand({ TableName: IMPACT_METRICS_TABLE, Key: { metricId } }));
  if (!existing.Item) {
    return json(404, headers, { error: "Metric not found" });
  }

  const value = typeof payload.value === "string" ? payload.value.trim().slice(0, 40) : existing.Item.value;
  const label = { ...existing.Item.label };
  const note = { ...existing.Item.note };
  if (payload.label && typeof payload.label === "object") {
    for (const locale of LOCALES) {
      if (typeof payload.label[locale] === "string") label[locale] = payload.label[locale].trim().slice(0, 100);
    }
  }
  if (payload.note && typeof payload.note === "object") {
    for (const locale of LOCALES) {
      if (typeof payload.note[locale] === "string") note[locale] = payload.note[locale].trim().slice(0, 200);
    }
  }

  const updatedAt = new Date().toISOString();
  await ddb.send(
    new PutCommand({
      TableName: IMPACT_METRICS_TABLE,
      Item: { ...existing.Item, value, label, note, updatedAt },
    })
  );

  return json(200, headers, { ok: true });
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Other locales default to the English text on create (same "needs translation" convention
// used for admin-created events) — there's no existing translated value to preserve yet.
async function handleCreateImpactMetric(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const labelEn = typeof payload.labelEn === "string" ? payload.labelEn.trim().slice(0, 100) : "";
  const value = typeof payload.value === "string" ? payload.value.trim().slice(0, 40) : "";
  const noteEn = typeof payload.noteEn === "string" ? payload.noteEn.trim().slice(0, 200) : "";
  if (!labelEn || !value) {
    return json(400, headers, { error: "value and labelEn are required" });
  }

  const metricId = slugify(labelEn) || randomUUID();
  const existing = await ddb.send(new GetCommand({ TableName: IMPACT_METRICS_TABLE, Key: { metricId } }));
  if (existing.Item) {
    return json(409, headers, { error: "A metric with that label already exists" });
  }

  const all = await ddb.send(new ScanCommand({ TableName: IMPACT_METRICS_TABLE }));
  const nextOrder = Math.max(0, ...(all.Items || []).map((m) => m.order ?? 0)) + 1;

  const label = Object.fromEntries(LOCALES.map((l) => [l, labelEn]));
  const note = Object.fromEntries(LOCALES.map((l) => [l, noteEn]));

  await ddb.send(
    new PutCommand({
      TableName: IMPACT_METRICS_TABLE,
      Item: { metricId, value, label, note, order: nextOrder, updatedAt: new Date().toISOString() },
    })
  );

  return json(200, headers, { ok: true, metricId });
}

async function handleDeleteImpactMetric(headers, metricId) {
  await ddb.send(new DeleteCommand({ TableName: IMPACT_METRICS_TABLE, Key: { metricId } }));
  return json(200, headers, { ok: true });
}

async function handleGetSubmissions(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = (result.Items || [])
    .filter((item) => !String(item.id).startsWith("ratelimit#"))
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  return json(200, headers, { submissions: items });
}

async function handleDeleteSubmission(headers, id) {
  await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
  return json(200, headers, { ok: true });
}

async function handleGetEventRsvpCounts(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  const counts = {};
  for (const item of result.Items || []) {
    if (item.interestType !== "event" || !item.eventSlug) continue;
    counts[item.eventSlug] = (counts[item.eventSlug] || 0) + 1;
  }
  return json(200, headers, { counts });
}

async function handleGetStorySubmissions(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: STORY_SUBMISSIONS_TABLE }));
  const items = (result.Items || []).sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  return json(200, headers, { submissions: items });
}

async function handleUpdateStorySubmission(event, headers, id) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const status = payload.status;
  if (!["approved", "rejected"].includes(status)) {
    return json(400, headers, { error: "status must be 'approved' or 'rejected'" });
  }

  await ddb.send(
    new UpdateCommand({
      TableName: STORY_SUBMISSIONS_TABLE,
      Key: { id },
      UpdateExpression: "SET #status = :status, reviewedAt = :reviewedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status, ":reviewedAt": new Date().toISOString() },
    })
  );

  return json(200, headers, { ok: true });
}

async function handleDeleteStorySubmission(headers, id) {
  await ddb.send(new DeleteCommand({ TableName: STORY_SUBMISSIONS_TABLE, Key: { id } }));
  return json(200, headers, { ok: true });
}

async function handleGetApprovedStories(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: STORY_SUBMISSIONS_TABLE }));
  const items = (result.Items || [])
    .filter((item) => item.status === "approved")
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""))
    .map((item) => ({ id: item.id, authorName: item.authorName, title: item.title, body: item.body, submittedAt: item.submittedAt }));
  return json(200, headers, { stories: items });
}

async function handleGetEvents(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: EVENTS_TABLE }));
  const items = (result.Items || []).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return json(200, headers, { events: items });
}

// Same "other locales default to English on create, preserved on update" convention as
// impact metrics — see handleCreateImpactMetric / handleUpdateImpactMetric above.
async function handleCreateEvent(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const titleEn = typeof payload.titleEn === "string" ? payload.titleEn.trim().slice(0, 200) : "";
  const typeEn = typeof payload.typeEn === "string" ? payload.typeEn.trim().slice(0, 60) : "";
  const date = typeof payload.date === "string" ? payload.date.trim().slice(0, 20) : "";
  const locationEn = typeof payload.locationEn === "string" ? payload.locationEn.trim().slice(0, 200) : "";
  const bodyEn = typeof payload.bodyEn === "string" ? payload.bodyEn.trim().slice(0, 5000) : "";
  const capacity = Number.isFinite(Number(payload.capacity)) && payload.capacity !== "" ? Number(payload.capacity) : undefined;

  if (!titleEn || !typeEn || !date || !locationEn || !bodyEn) {
    return json(400, headers, { error: "titleEn, typeEn, date, locationEn, and bodyEn are required" });
  }

  const slug = slugify(titleEn);
  if (!slug) {
    return json(400, headers, { error: "Could not derive a slug from titleEn" });
  }
  const existing = await ddb.send(new GetCommand({ TableName: EVENTS_TABLE, Key: { slug } }));
  if (existing.Item) {
    return json(409, headers, { error: "An event with that title/slug already exists" });
  }

  const bodyParagraphs = bodyEn.split(/\n+/).filter(Boolean);
  const item = {
    slug,
    type: Object.fromEntries(LOCALES.map((l) => [l, typeEn])),
    title: Object.fromEntries(LOCALES.map((l) => [l, titleEn])),
    date,
    location: Object.fromEntries(LOCALES.map((l) => [l, locationEn])),
    body: Object.fromEntries(LOCALES.map((l) => [l, bodyParagraphs])),
    ...(capacity !== undefined ? { capacity } : {}),
    updatedAt: new Date().toISOString(),
  };

  await ddb.send(new PutCommand({ TableName: EVENTS_TABLE, Item: item }));
  return json(200, headers, { ok: true, slug });
}

async function handleUpdateEvent(event, headers, slug) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const existing = await ddb.send(new GetCommand({ TableName: EVENTS_TABLE, Key: { slug } }));
  if (!existing.Item) {
    return json(404, headers, { error: "Event not found" });
  }

  const item = { ...existing.Item };
  if (typeof payload.titleEn === "string") item.title = { ...item.title, en: payload.titleEn.trim().slice(0, 200) };
  if (typeof payload.typeEn === "string") item.type = { ...item.type, en: payload.typeEn.trim().slice(0, 60) };
  if (typeof payload.locationEn === "string") item.location = { ...item.location, en: payload.locationEn.trim().slice(0, 200) };
  if (typeof payload.date === "string" && payload.date.trim()) item.date = payload.date.trim().slice(0, 20);
  if (typeof payload.bodyEn === "string") {
    item.body = { ...item.body, en: payload.bodyEn.trim().slice(0, 5000).split(/\n+/).filter(Boolean) };
  }
  if (payload.capacity !== undefined) {
    const capacity = Number(payload.capacity);
    if (payload.capacity === "" || payload.capacity === null) delete item.capacity;
    else if (Number.isFinite(capacity)) item.capacity = capacity;
  }
  item.updatedAt = new Date().toISOString();

  await ddb.send(new PutCommand({ TableName: EVENTS_TABLE, Item: item }));
  return json(200, headers, { ok: true });
}

async function handleDeleteEvent(headers, slug) {
  await ddb.send(new DeleteCommand({ TableName: EVENTS_TABLE, Key: { slug } }));
  return json(200, headers, { ok: true });
}

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };

  const method = event.requestContext?.http?.method;
  const path = event.rawPath || "";

  if (method === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (method === "GET" && path === "/health") {
    return json(200, headers, { ok: true });
  }

  if (method === "POST" && path === "/submit-interest") {
    return handleSubmitInterest(event, headers);
  }

  if (method === "POST" && path === "/submit-story") {
    return handleSubmitStory(event, headers);
  }

  // Public read of approved community stories — no internal-key required, this is meant to
  // be fetched by the public /blog page at request time.
  if (method === "GET" && path === "/community-stories") {
    return handleGetApprovedStories(headers);
  }

  // Public read of the homepage impact numbers — same reasoning as /community-stories above.
  // Writing them (PUT /internal/impact-metrics/{id}) still requires the internal key.
  if (method === "GET" && path === "/impact-metrics") {
    return handleGetImpactMetrics(headers);
  }

  // Public read of live event RSVP counts, so event pages (not just the admin dashboard)
  // can show real numbers instead of the manually-maintained siteContent.ts capacity field.
  if (method === "GET" && path === "/event-rsvp-counts") {
    return handleGetEventRsvpCounts(headers);
  }

  // Public read of events themselves — the source of truth moved from siteContent.ts (static)
  // to DynamoDB so admins can create/edit/delete events without a code change + deploy.
  if (method === "GET" && path === "/events") {
    return handleGetEvents(headers);
  }

  // Public: the password check itself obviously can't require already being authenticated.
  if (method === "POST" && path === "/admin-login") {
    return handleAdminLogin(event, headers);
  }

  // Public: called by proxy.ts (Next's middleware, Edge runtime) on every /admin/* page load
  // to check the session cookie's validity — safe to be unauthenticated since it only answers
  // "is this specific token currently valid", it can't be used to forge or discover one.
  if (method === "POST" && path === "/verify-session") {
    return handleVerifySession(event, headers);
  }

  // Everything else under /internal/* requires a currently-valid admin session token (the
  // same one issued by /admin-login and checked by /verify-session) rather than a separate
  // static key — ties data-access authorization directly to being logged in as admin.
  if (path.startsWith("/internal/")) {
    if (!requireValidAdminToken(event)) {
      return json(401, headers, { error: "Unauthorized" });
    }

    if (method === "GET" && path === "/internal/impact-metrics") {
      return handleGetImpactMetrics(headers);
    }
    if (method === "POST" && path === "/internal/impact-metrics") {
      return handleCreateImpactMetric(event, headers);
    }
    const metricMatch = path.match(/^\/internal\/impact-metrics\/([^/]+)$/);
    if (method === "PUT" && metricMatch) {
      return handleUpdateImpactMetric(event, headers, decodeURIComponent(metricMatch[1]));
    }
    if (method === "DELETE" && metricMatch) {
      return handleDeleteImpactMetric(headers, decodeURIComponent(metricMatch[1]));
    }
    if (method === "GET" && path === "/internal/submissions") {
      return handleGetSubmissions(headers);
    }
    const submissionMatch = path.match(/^\/internal\/submissions\/([^/]+)$/);
    if (method === "DELETE" && submissionMatch) {
      return handleDeleteSubmission(headers, decodeURIComponent(submissionMatch[1]));
    }
    if (method === "GET" && path === "/internal/event-rsvp-counts") {
      return handleGetEventRsvpCounts(headers);
    }
    if (method === "GET" && path === "/internal/story-submissions") {
      return handleGetStorySubmissions(headers);
    }
    const storyMatch = path.match(/^\/internal\/story-submissions\/([^/]+)$/);
    if (method === "PATCH" && storyMatch) {
      return handleUpdateStorySubmission(event, headers, decodeURIComponent(storyMatch[1]));
    }
    if (method === "DELETE" && storyMatch) {
      return handleDeleteStorySubmission(headers, decodeURIComponent(storyMatch[1]));
    }
    if (method === "GET" && path === "/internal/events") {
      return handleGetEvents(headers);
    }
    if (method === "POST" && path === "/internal/events") {
      return handleCreateEvent(event, headers);
    }
    const eventMatch = path.match(/^\/internal\/events\/([^/]+)$/);
    if (method === "PUT" && eventMatch) {
      return handleUpdateEvent(event, headers, decodeURIComponent(eventMatch[1]));
    }
    if (method === "DELETE" && eventMatch) {
      return handleDeleteEvent(headers, decodeURIComponent(eventMatch[1]));
    }
    if (method === "PATCH" && path === "/internal/admin-password") {
      return handleChangePassword(event, headers);
    }

    return json(404, headers, { error: "Not found" });
  }

  return json(404, headers, { error: "Not found" });
};
