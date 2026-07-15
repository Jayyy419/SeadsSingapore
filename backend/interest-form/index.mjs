import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID, createHmac, timingSafeEqual, scryptSync, randomBytes } from "node:crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});
const secretsManager = new SecretsManagerClient({});
const s3 = new S3Client({});

// A plain ScanCommand caps out at ~1MB per call and silently returns only a partial result
// past that — no error, just missing rows. Every table here is small enough that looping
// through LastEvaluatedKey until it's exhausted costs one extra round-trip at worst, and
// guarantees callers always see the complete table rather than a size-dependent truncation.
async function scanAll(tableName) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const result = await ddb.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey }));
    items.push(...(result.Items || []));
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

// Used by every handleUpdate* to report which fields an edit actually changed, for the audit
// log — the create/update Server Actions always submit every field on the form regardless of
// whether the admin touched it, so "which keys were in the payload" wouldn't answer "what
// changed"; only comparing old vs. new values does.
function diffFields(oldItem, newItem, fields) {
  return fields.filter((f) => JSON.stringify(oldItem[f]) !== JSON.stringify(newItem[f]));
}

const TABLE_NAME = process.env.TABLE_NAME;
const IMPACT_METRICS_TABLE = process.env.IMPACT_METRICS_TABLE;
const STORY_SUBMISSIONS_TABLE = process.env.STORY_SUBMISSIONS_TABLE;
const ADMIN_CONFIG_TABLE = process.env.ADMIN_CONFIG_TABLE;
const EVENTS_TABLE = process.env.EVENTS_TABLE;
const AUDIT_LOG_TABLE = process.env.AUDIT_LOG_TABLE;
const TEAM_TABLE = process.env.TEAM_TABLE;
const PARTNERS_TABLE = process.env.PARTNERS_TABLE;
const PROGRAMS_TABLE = process.env.PROGRAMS_TABLE;
const STORIES_TABLE = process.env.STORIES_TABLE;
const MEDIA_BUCKET = process.env.MEDIA_BUCKET;
const MEDIA_BUCKET_REGION = process.env.AWS_REGION || "ap-southeast-1";
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

// There's only one shared admin password, not per-user accounts, so this can't attribute an
// action to a specific person — only record what changed and when, plus the source IP as a
// weak (not fabricated) signal for distinguishing concurrent sessions. Best-effort: a failure
// here never blocks the actual write it's logging, since an audit trail going missing is far
// less bad than an admin action failing because logging it didn't work.
const AUDIT_LOG_TTL_SECONDS = 60 * 60 * 24 * 365;

async function logAudit(event, action, entityType, detail) {
  if (!AUDIT_LOG_TABLE) return;
  try {
    await ddb.send(
      new PutCommand({
        TableName: AUDIT_LOG_TABLE,
        Item: {
          id: randomUUID(),
          timestamp: new Date().toISOString(),
          action,
          entityType,
          detail,
          sourceIp: event.requestContext?.http?.sourceIp,
          ttl: Math.floor(Date.now() / 1000) + AUDIT_LOG_TTL_SECONDS,
        },
      })
    );
  } catch (err) {
    console.error("Audit log write failed:", err);
  }
}

// Builds the audit log's `detail` string for an update: the slug alone, or the slug plus
// which fields actually changed (from the `changed` array a handleUpdate* response includes)
// when there's something to show — see diffFields() above for how that array is computed.
function withChanges(slug, res) {
  try {
    const body = JSON.parse(res.body);
    return body.changed?.length ? `${slug} (${body.changed.join(", ")})` : slug;
  } catch {
    return slug;
  }
}

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

  // Same "notify but never fail the request over it" policy as handleSubmitInterest above —
  // without this, a new submission sat in the moderation queue with nothing telling an admin
  // to go look.
  if (NOTIFY_EMAIL) {
    try {
      await ses.send(
        new SendEmailCommand({
          Source: NOTIFY_EMAIL,
          Destination: { ToAddresses: [NOTIFY_EMAIL] },
          Message: {
            Subject: { Data: `New Seads story submission from ${authorName}` },
            Body: {
              Text: {
                Data: `Author: ${authorName}\nEmail: ${authorEmail}\nTitle: ${title}\nSubmitted: ${submittedAt}\n\nReview at /admin/stories`,
              },
            },
          },
        })
      );
    } catch (err) {
      console.error("SES send failed:", err);
    }
  }

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

// Unlike the public interest-form/story endpoints, there's only one shared password and no
// per-user identity to rate-limit by — IP is the only signal available, same weak-but-better-
// than-nothing caveat as the audit log's sourceIp. 10 attempts per 10-minute window is loose
// enough that a legitimate admin mistyping the password a few times (or several people behind
// the same office/NAT IP) won't get locked out, but rules out realistic brute-forcing.
async function handleAdminLogin(event, headers) {
  const remoteIp = event.requestContext?.http?.sourceIp;
  if (remoteIp && !(await checkRateLimit(`ip#adminlogin#${remoteIp}`, 10))) {
    return json(429, headers, { ok: false, error: "Too many attempts — please try again in a few minutes." });
  }

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
  const items = (await scanAll(IMPACT_METRICS_TABLE)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
  const order = Number.isFinite(Number(payload.order)) ? Number(payload.order) : existing.Item.order;

  const updatedAt = new Date().toISOString();
  const item = { ...existing.Item, value, label, note, order, updatedAt };
  const changed = diffFields(existing.Item, item, ["value", "label", "note", "order"]);
  await ddb.send(new PutCommand({ TableName: IMPACT_METRICS_TABLE, Item: item }));

  return json(200, headers, { ok: true, changed });
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

  const all = await scanAll(IMPACT_METRICS_TABLE);
  const nextOrder = Math.max(0, ...all.map((m) => m.order ?? 0)) + 1;

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
  const items = (await scanAll(TABLE_NAME))
    .filter((item) => !String(item.id).startsWith("ratelimit#"))
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  return json(200, headers, { submissions: items });
}

async function handleDeleteSubmission(headers, id) {
  await ddb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
  return json(200, headers, { ok: true });
}

async function handleGetEventRsvpCounts(headers) {
  const counts = {};
  for (const item of await scanAll(TABLE_NAME)) {
    if (item.interestType !== "event" || !item.eventSlug) continue;
    counts[item.eventSlug] = (counts[item.eventSlug] || 0) + 1;
  }
  return json(200, headers, { counts });
}

async function handleGetStorySubmissions(headers) {
  const items = (await scanAll(STORY_SUBMISSIONS_TABLE)).sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
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
  const items = (await scanAll(STORY_SUBMISSIONS_TABLE))
    .filter((item) => item.status === "approved")
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""))
    .map((item) => ({ id: item.id, authorName: item.authorName, title: item.title, body: item.body, submittedAt: item.submittedAt }));
  return json(200, headers, { stories: items });
}

async function handleGetEvents(headers) {
  const items = (await scanAll(EVENTS_TABLE)).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return json(200, headers, { events: items });
}

async function handleGetAuditLog(headers) {
  const items = (await scanAll(AUDIT_LOG_TABLE)).sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
  return json(200, headers, { entries: items });
}

const ALLOWED_UPLOAD_CONTENT_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// The admin's browser uploads the actual file bytes directly to S3 using this presigned URL —
// never through this Lambda/API Gateway, which have their own request-body size limits far
// below what a photo needs. This endpoint only ever hands out permission to PUT one specific
// new object; it can't be used to read, overwrite, or delete anything else in the bucket.
async function handleCreateUploadUrl(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const contentType = payload.contentType;
  const extension = ALLOWED_UPLOAD_CONTENT_TYPES[contentType];
  if (!extension) {
    return json(400, headers, { error: "contentType must be one of: " + Object.keys(ALLOWED_UPLOAD_CONTENT_TYPES).join(", ") });
  }

  const key = `uploads/${randomUUID()}.${extension}`;
  // Max file size is enforced client-side only (via the maxBytes hint below) — a presigned PUT
  // URL can't itself cap the object size the way a presigned POST policy can. Acceptable here
  // since this endpoint is admin-only, not public.
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: MEDIA_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  );
  const publicUrl = `https://${MEDIA_BUCKET}.s3.${MEDIA_BUCKET_REGION}.amazonaws.com/${key}`;

  return json(200, headers, { uploadUrl, publicUrl, maxBytes: MAX_UPLOAD_BYTES });
}

const MEDIA_BUCKET_ORIGIN = `https://${MEDIA_BUCKET}.s3.${MEDIA_BUCKET_REGION}.amazonaws.com/`;

// Best-effort cleanup for the common "admin replaces or removes a photo" case, called from
// every entity's update/delete handler below — without this, every replaced or removed photo
// would sit in S3 unreferenced forever. Only ever touches URLs actually inside our own
// uploads/ prefix (never a hardcoded/external URL slipped into a photo field), and never
// blocks or fails the request it's called from if the delete itself fails — the DynamoDB
// write it's cleaning up after already succeeded by the time this runs.
async function deleteMediaObjectIfOwned(url) {
  if (!url || !url.startsWith(MEDIA_BUCKET_ORIGIN)) return;
  const key = url.slice(MEDIA_BUCKET_ORIGIN.length);
  if (!key.startsWith("uploads/")) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: MEDIA_BUCKET, Key: key }));
  } catch (err) {
    console.error("Failed to delete old media object:", err);
  }
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
  const changed = diffFields(existing.Item, item, ["title", "type", "location", "date", "body", "capacity"]);

  await ddb.send(new PutCommand({ TableName: EVENTS_TABLE, Item: item }));
  return json(200, headers, { ok: true, changed });
}

async function handleDeleteEvent(headers, slug) {
  await ddb.send(new DeleteCommand({ TableName: EVENTS_TABLE, Key: { slug } }));
  return json(200, headers, { ok: true });
}

async function handleGetTeam(headers) {
  const items = (await scanAll(TEAM_TABLE)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return json(200, headers, { team: items });
}

// Same "English editable, other locales default to English on create / preserved on update"
// convention as impact metrics and events — see handleCreateImpactMetric above.
async function handleCreateTeamMember(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const roleEn = typeof payload.roleEn === "string" ? payload.roleEn.trim().slice(0, 100) : "";
  const bioEn = typeof payload.bioEn === "string" ? payload.bioEn.trim().slice(0, 1000) : "";
  const photo = typeof payload.photo === "string" ? payload.photo.trim().slice(0, 500) : "";

  if (!name || !roleEn || !bioEn) {
    return json(400, headers, { error: "name, roleEn, and bioEn are required" });
  }

  const slug = slugify(name);
  if (!slug) {
    return json(400, headers, { error: "Could not derive a slug from name" });
  }
  const existing = await ddb.send(new GetCommand({ TableName: TEAM_TABLE, Key: { slug } }));
  if (existing.Item) {
    return json(409, headers, { error: "A team member with that name already exists" });
  }

  const all = await scanAll(TEAM_TABLE);
  const nextOrder = Math.max(0, ...all.map((m) => m.order ?? 0)) + 1;

  const item = {
    slug,
    name,
    role: Object.fromEntries(LOCALES.map((l) => [l, roleEn])),
    bio: Object.fromEntries(LOCALES.map((l) => [l, bioEn])),
    photo,
    order: nextOrder,
    updatedAt: new Date().toISOString(),
  };

  await ddb.send(new PutCommand({ TableName: TEAM_TABLE, Item: item }));
  return json(200, headers, { ok: true, slug });
}

async function handleUpdateTeamMember(event, headers, slug) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const existing = await ddb.send(new GetCommand({ TableName: TEAM_TABLE, Key: { slug } }));
  if (!existing.Item) {
    return json(404, headers, { error: "Team member not found" });
  }

  const item = { ...existing.Item };
  if (typeof payload.name === "string" && payload.name.trim()) item.name = payload.name.trim().slice(0, 100);
  if (typeof payload.roleEn === "string") item.role = { ...item.role, en: payload.roleEn.trim().slice(0, 100) };
  if (typeof payload.bioEn === "string") item.bio = { ...item.bio, en: payload.bioEn.trim().slice(0, 1000) };
  if (typeof payload.photo === "string") {
    const newPhoto = payload.photo.trim().slice(0, 500);
    if (existing.Item.photo && existing.Item.photo !== newPhoto) await deleteMediaObjectIfOwned(existing.Item.photo);
    item.photo = newPhoto;
  }
  if (Number.isFinite(Number(payload.order))) item.order = Number(payload.order);
  item.updatedAt = new Date().toISOString();
  const changed = diffFields(existing.Item, item, ["name", "role", "bio", "photo", "order"]);

  await ddb.send(new PutCommand({ TableName: TEAM_TABLE, Item: item }));
  return json(200, headers, { ok: true, changed });
}

async function handleDeleteTeamMember(headers, slug) {
  const existing = await ddb.send(new GetCommand({ TableName: TEAM_TABLE, Key: { slug } }));
  if (existing.Item?.photo) await deleteMediaObjectIfOwned(existing.Item.photo);
  await ddb.send(new DeleteCommand({ TableName: TEAM_TABLE, Key: { slug } }));
  return json(200, headers, { ok: true });
}

async function handleGetPartners(headers) {
  const items = (await scanAll(PARTNERS_TABLE)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return json(200, headers, { partners: items });
}

// Partner names are proper nouns, not translated — no per-locale fields needed here, unlike
// team/events/impact-metrics.
async function handleCreatePartner(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 100) : "";
  const logo = typeof payload.logo === "string" ? payload.logo.trim().slice(0, 500) : "";
  const website = typeof payload.website === "string" ? payload.website.trim().slice(0, 300) : "";

  if (!name) {
    return json(400, headers, { error: "name is required" });
  }

  const slug = slugify(name);
  if (!slug) {
    return json(400, headers, { error: "Could not derive a slug from name" });
  }
  const existing = await ddb.send(new GetCommand({ TableName: PARTNERS_TABLE, Key: { slug } }));
  if (existing.Item) {
    return json(409, headers, { error: "A partner with that name already exists" });
  }

  const all = await scanAll(PARTNERS_TABLE);
  const nextOrder = Math.max(0, ...all.map((p) => p.order ?? 0)) + 1;

  const item = { slug, name, logo, website, order: nextOrder, updatedAt: new Date().toISOString() };
  await ddb.send(new PutCommand({ TableName: PARTNERS_TABLE, Item: item }));
  return json(200, headers, { ok: true, slug });
}

async function handleUpdatePartner(event, headers, slug) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const existing = await ddb.send(new GetCommand({ TableName: PARTNERS_TABLE, Key: { slug } }));
  if (!existing.Item) {
    return json(404, headers, { error: "Partner not found" });
  }

  const item = { ...existing.Item };
  if (typeof payload.name === "string" && payload.name.trim()) item.name = payload.name.trim().slice(0, 100);
  if (typeof payload.logo === "string") {
    const newLogo = payload.logo.trim().slice(0, 500);
    if (existing.Item.logo && existing.Item.logo !== newLogo) await deleteMediaObjectIfOwned(existing.Item.logo);
    item.logo = newLogo;
  }
  if (typeof payload.website === "string") item.website = payload.website.trim().slice(0, 300);
  if (Number.isFinite(Number(payload.order))) item.order = Number(payload.order);
  item.updatedAt = new Date().toISOString();
  const changed = diffFields(existing.Item, item, ["name", "logo", "website", "order"]);

  await ddb.send(new PutCommand({ TableName: PARTNERS_TABLE, Item: item }));
  return json(200, headers, { ok: true, changed });
}

async function handleDeletePartner(headers, slug) {
  const existing = await ddb.send(new GetCommand({ TableName: PARTNERS_TABLE, Key: { slug } }));
  if (existing.Item?.logo) await deleteMediaObjectIfOwned(existing.Item.logo);
  await ddb.send(new DeleteCommand({ TableName: PARTNERS_TABLE, Key: { slug } }));
  return json(200, headers, { ok: true });
}

async function handleGetPrograms(headers) {
  const items = (await scanAll(PROGRAMS_TABLE)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return json(200, headers, { programs: items });
}

// Same "English editable, other locales default to English on create / preserved on update"
// convention as events — see handleCreateEvent above.
async function handleCreateProgram(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const tagEn = typeof payload.tagEn === "string" ? payload.tagEn.trim().slice(0, 60) : "";
  const nameEn = typeof payload.nameEn === "string" ? payload.nameEn.trim().slice(0, 100) : "";
  const descriptionEn = typeof payload.descriptionEn === "string" ? payload.descriptionEn.trim().slice(0, 300) : "";
  const whoEn = typeof payload.whoEn === "string" ? payload.whoEn.trim().slice(0, 300) : "";
  const bodyEn = typeof payload.bodyEn === "string" ? payload.bodyEn.trim().slice(0, 5000) : "";
  const photo = typeof payload.photo === "string" ? payload.photo.trim().slice(0, 500) : "";

  if (!tagEn || !nameEn || !descriptionEn || !whoEn || !bodyEn) {
    return json(400, headers, { error: "tagEn, nameEn, descriptionEn, whoEn, and bodyEn are required" });
  }

  const slug = slugify(nameEn);
  if (!slug) {
    return json(400, headers, { error: "Could not derive a slug from nameEn" });
  }
  const existing = await ddb.send(new GetCommand({ TableName: PROGRAMS_TABLE, Key: { slug } }));
  if (existing.Item) {
    return json(409, headers, { error: "A program with that name already exists" });
  }

  const all = await scanAll(PROGRAMS_TABLE);
  const nextOrder = Math.max(0, ...all.map((p) => p.order ?? 0)) + 1;

  const bodyParagraphs = bodyEn.split(/\n+/).filter(Boolean);
  const item = {
    slug,
    tag: Object.fromEntries(LOCALES.map((l) => [l, tagEn])),
    name: Object.fromEntries(LOCALES.map((l) => [l, nameEn])),
    description: Object.fromEntries(LOCALES.map((l) => [l, descriptionEn])),
    who: Object.fromEntries(LOCALES.map((l) => [l, whoEn])),
    body: Object.fromEntries(LOCALES.map((l) => [l, bodyParagraphs])),
    photo,
    order: nextOrder,
    updatedAt: new Date().toISOString(),
  };

  await ddb.send(new PutCommand({ TableName: PROGRAMS_TABLE, Item: item }));
  return json(200, headers, { ok: true, slug });
}

async function handleUpdateProgram(event, headers, slug) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const existing = await ddb.send(new GetCommand({ TableName: PROGRAMS_TABLE, Key: { slug } }));
  if (!existing.Item) {
    return json(404, headers, { error: "Program not found" });
  }

  const item = { ...existing.Item };
  if (typeof payload.tagEn === "string") item.tag = { ...item.tag, en: payload.tagEn.trim().slice(0, 60) };
  if (typeof payload.nameEn === "string") item.name = { ...item.name, en: payload.nameEn.trim().slice(0, 100) };
  if (typeof payload.descriptionEn === "string") item.description = { ...item.description, en: payload.descriptionEn.trim().slice(0, 300) };
  if (typeof payload.whoEn === "string") item.who = { ...item.who, en: payload.whoEn.trim().slice(0, 300) };
  if (typeof payload.bodyEn === "string") {
    item.body = { ...item.body, en: payload.bodyEn.trim().slice(0, 5000).split(/\n+/).filter(Boolean) };
  }
  if (typeof payload.photo === "string") {
    const newPhoto = payload.photo.trim().slice(0, 500);
    if (existing.Item.photo && existing.Item.photo !== newPhoto) await deleteMediaObjectIfOwned(existing.Item.photo);
    item.photo = newPhoto;
  }
  if (Number.isFinite(Number(payload.order))) item.order = Number(payload.order);
  item.updatedAt = new Date().toISOString();
  const changed = diffFields(existing.Item, item, ["tag", "name", "description", "who", "body", "photo", "order"]);

  await ddb.send(new PutCommand({ TableName: PROGRAMS_TABLE, Item: item }));
  return json(200, headers, { ok: true, changed });
}

async function handleDeleteProgram(headers, slug) {
  const existing = await ddb.send(new GetCommand({ TableName: PROGRAMS_TABLE, Key: { slug } }));
  if (existing.Item?.photo) await deleteMediaObjectIfOwned(existing.Item.photo);
  await ddb.send(new DeleteCommand({ TableName: PROGRAMS_TABLE, Key: { slug } }));
  return json(200, headers, { ok: true });
}

// "Official" staff-authored blog posts — deliberately a separate table from
// STORY_SUBMISSIONS_TABLE (the community-submission moderation queue). Community stories are
// English-only, have no slug/detail page, and go through an approve/reject workflow; these are
// fully localized, slugged, admin-authored directly (no moderation step), and get their own
// /blog/[slug] page — different enough shapes and workflows that merging them into one table
// would need a "kind" discriminator complicating both, for no real benefit at this scale.
async function handleGetStories(headers) {
  const items = (await scanAll(STORIES_TABLE)).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return json(200, headers, { stories: items });
}

async function handleCreateStory(event, headers) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const categoryEn = typeof payload.categoryEn === "string" ? payload.categoryEn.trim().slice(0, 60) : "";
  const titleEn = typeof payload.titleEn === "string" ? payload.titleEn.trim().slice(0, 200) : "";
  const excerptEn = typeof payload.excerptEn === "string" ? payload.excerptEn.trim().slice(0, 300) : "";
  const bodyEn = typeof payload.bodyEn === "string" ? payload.bodyEn.trim().slice(0, 5000) : "";
  const photo = typeof payload.photo === "string" ? payload.photo.trim().slice(0, 500) : "";

  if (!categoryEn || !titleEn || !excerptEn || !bodyEn) {
    return json(400, headers, { error: "categoryEn, titleEn, excerptEn, and bodyEn are required" });
  }

  const slug = slugify(titleEn);
  if (!slug) {
    return json(400, headers, { error: "Could not derive a slug from titleEn" });
  }
  const existing = await ddb.send(new GetCommand({ TableName: STORIES_TABLE, Key: { slug } }));
  if (existing.Item) {
    return json(409, headers, { error: "A story with that title already exists" });
  }

  const bodyParagraphs = bodyEn.split(/\n+/).filter(Boolean);
  const item = {
    slug,
    category: Object.fromEntries(LOCALES.map((l) => [l, categoryEn])),
    title: Object.fromEntries(LOCALES.map((l) => [l, titleEn])),
    excerpt: Object.fromEntries(LOCALES.map((l) => [l, excerptEn])),
    body: Object.fromEntries(LOCALES.map((l) => [l, bodyParagraphs])),
    photo,
    updatedAt: new Date().toISOString(),
  };

  await ddb.send(new PutCommand({ TableName: STORIES_TABLE, Item: item }));
  return json(200, headers, { ok: true, slug });
}

async function handleUpdateStory(event, headers, slug) {
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, headers, { error: "Invalid JSON body" });
  }

  const existing = await ddb.send(new GetCommand({ TableName: STORIES_TABLE, Key: { slug } }));
  if (!existing.Item) {
    return json(404, headers, { error: "Story not found" });
  }

  const item = { ...existing.Item };
  if (typeof payload.categoryEn === "string") item.category = { ...item.category, en: payload.categoryEn.trim().slice(0, 60) };
  if (typeof payload.titleEn === "string") item.title = { ...item.title, en: payload.titleEn.trim().slice(0, 200) };
  if (typeof payload.excerptEn === "string") item.excerpt = { ...item.excerpt, en: payload.excerptEn.trim().slice(0, 300) };
  if (typeof payload.bodyEn === "string") {
    item.body = { ...item.body, en: payload.bodyEn.trim().slice(0, 5000).split(/\n+/).filter(Boolean) };
  }
  if (typeof payload.photo === "string") {
    const newPhoto = payload.photo.trim().slice(0, 500);
    if (existing.Item.photo && existing.Item.photo !== newPhoto) await deleteMediaObjectIfOwned(existing.Item.photo);
    item.photo = newPhoto;
  }
  item.updatedAt = new Date().toISOString();
  const changed = diffFields(existing.Item, item, ["category", "title", "excerpt", "body", "photo"]);

  await ddb.send(new PutCommand({ TableName: STORIES_TABLE, Item: item }));
  return json(200, headers, { ok: true, changed });
}

async function handleDeleteStory(headers, slug) {
  const existing = await ddb.send(new GetCommand({ TableName: STORIES_TABLE, Key: { slug } }));
  if (existing.Item?.photo) await deleteMediaObjectIfOwned(existing.Item.photo);
  await ddb.send(new DeleteCommand({ TableName: STORIES_TABLE, Key: { slug } }));
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

  // Same reasoning as /events above.
  if (method === "GET" && path === "/team") {
    return handleGetTeam(headers);
  }

  // Same reasoning as /events above.
  if (method === "GET" && path === "/partners") {
    return handleGetPartners(headers);
  }

  // Same reasoning as /events above.
  if (method === "GET" && path === "/programs") {
    return handleGetPrograms(headers);
  }

  // Same reasoning as /events above.
  if (method === "GET" && path === "/stories") {
    return handleGetStories(headers);
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
      const res = await handleCreateImpactMetric(event, headers);
      if (res.statusCode < 300) await logAudit(event, "create", "impact-metric", JSON.parse(res.body).metricId);
      return res;
    }
    const metricMatch = path.match(/^\/internal\/impact-metrics\/([^/]+)$/);
    if (method === "PUT" && metricMatch) {
      const metricId = decodeURIComponent(metricMatch[1]);
      const res = await handleUpdateImpactMetric(event, headers, metricId);
      if (res.statusCode < 300) await logAudit(event, "update", "impact-metric", withChanges(metricId, res));
      return res;
    }
    if (method === "DELETE" && metricMatch) {
      const metricId = decodeURIComponent(metricMatch[1]);
      const res = await handleDeleteImpactMetric(headers, metricId);
      if (res.statusCode < 300) await logAudit(event, "delete", "impact-metric", metricId);
      return res;
    }
    if (method === "GET" && path === "/internal/submissions") {
      return handleGetSubmissions(headers);
    }
    const submissionMatch = path.match(/^\/internal\/submissions\/([^/]+)$/);
    if (method === "DELETE" && submissionMatch) {
      const id = decodeURIComponent(submissionMatch[1]);
      const res = await handleDeleteSubmission(headers, id);
      if (res.statusCode < 300) await logAudit(event, "delete", "submission", id);
      return res;
    }
    if (method === "GET" && path === "/internal/event-rsvp-counts") {
      return handleGetEventRsvpCounts(headers);
    }
    if (method === "GET" && path === "/internal/story-submissions") {
      return handleGetStorySubmissions(headers);
    }
    const storyMatch = path.match(/^\/internal\/story-submissions\/([^/]+)$/);
    if (method === "PATCH" && storyMatch) {
      const id = decodeURIComponent(storyMatch[1]);
      const res = await handleUpdateStorySubmission(event, headers, id);
      if (res.statusCode < 300) {
        const status = JSON.parse(event.body || "{}").status;
        await logAudit(event, status === "approved" ? "approve" : "reject", "story-submission", id);
      }
      return res;
    }
    if (method === "DELETE" && storyMatch) {
      const id = decodeURIComponent(storyMatch[1]);
      const res = await handleDeleteStorySubmission(headers, id);
      if (res.statusCode < 300) await logAudit(event, "delete", "story-submission", id);
      return res;
    }
    if (method === "GET" && path === "/internal/events") {
      return handleGetEvents(headers);
    }
    if (method === "POST" && path === "/internal/events") {
      const res = await handleCreateEvent(event, headers);
      if (res.statusCode < 300) await logAudit(event, "create", "event", JSON.parse(res.body).slug);
      return res;
    }
    const eventMatch = path.match(/^\/internal\/events\/([^/]+)$/);
    if (method === "PUT" && eventMatch) {
      const slug = decodeURIComponent(eventMatch[1]);
      const res = await handleUpdateEvent(event, headers, slug);
      if (res.statusCode < 300) await logAudit(event, "update", "event", withChanges(slug, res));
      return res;
    }
    if (method === "DELETE" && eventMatch) {
      const slug = decodeURIComponent(eventMatch[1]);
      const res = await handleDeleteEvent(headers, slug);
      if (res.statusCode < 300) await logAudit(event, "delete", "event", slug);
      return res;
    }
    if (method === "PATCH" && path === "/internal/admin-password") {
      const res = await handleChangePassword(event, headers);
      if (res.statusCode < 300) await logAudit(event, "update", "admin-password", null);
      return res;
    }
    if (method === "GET" && path === "/internal/audit-log") {
      return handleGetAuditLog(headers);
    }
    if (method === "POST" && path === "/internal/uploads") {
      return handleCreateUploadUrl(event, headers);
    }
    if (method === "GET" && path === "/internal/team") {
      return handleGetTeam(headers);
    }
    if (method === "POST" && path === "/internal/team") {
      const res = await handleCreateTeamMember(event, headers);
      if (res.statusCode < 300) await logAudit(event, "create", "team-member", JSON.parse(res.body).slug);
      return res;
    }
    const teamMatch = path.match(/^\/internal\/team\/([^/]+)$/);
    if (method === "PUT" && teamMatch) {
      const slug = decodeURIComponent(teamMatch[1]);
      const res = await handleUpdateTeamMember(event, headers, slug);
      if (res.statusCode < 300) await logAudit(event, "update", "team-member", withChanges(slug, res));
      return res;
    }
    if (method === "DELETE" && teamMatch) {
      const slug = decodeURIComponent(teamMatch[1]);
      const res = await handleDeleteTeamMember(headers, slug);
      if (res.statusCode < 300) await logAudit(event, "delete", "team-member", slug);
      return res;
    }
    if (method === "GET" && path === "/internal/partners") {
      return handleGetPartners(headers);
    }
    if (method === "POST" && path === "/internal/partners") {
      const res = await handleCreatePartner(event, headers);
      if (res.statusCode < 300) await logAudit(event, "create", "partner", JSON.parse(res.body).slug);
      return res;
    }
    const partnerMatch = path.match(/^\/internal\/partners\/([^/]+)$/);
    if (method === "PUT" && partnerMatch) {
      const slug = decodeURIComponent(partnerMatch[1]);
      const res = await handleUpdatePartner(event, headers, slug);
      if (res.statusCode < 300) await logAudit(event, "update", "partner", withChanges(slug, res));
      return res;
    }
    if (method === "DELETE" && partnerMatch) {
      const slug = decodeURIComponent(partnerMatch[1]);
      const res = await handleDeletePartner(headers, slug);
      if (res.statusCode < 300) await logAudit(event, "delete", "partner", slug);
      return res;
    }
    if (method === "GET" && path === "/internal/programs") {
      return handleGetPrograms(headers);
    }
    if (method === "POST" && path === "/internal/programs") {
      const res = await handleCreateProgram(event, headers);
      if (res.statusCode < 300) await logAudit(event, "create", "program", JSON.parse(res.body).slug);
      return res;
    }
    const programMatch = path.match(/^\/internal\/programs\/([^/]+)$/);
    if (method === "PUT" && programMatch) {
      const slug = decodeURIComponent(programMatch[1]);
      const res = await handleUpdateProgram(event, headers, slug);
      if (res.statusCode < 300) await logAudit(event, "update", "program", withChanges(slug, res));
      return res;
    }
    if (method === "DELETE" && programMatch) {
      const slug = decodeURIComponent(programMatch[1]);
      const res = await handleDeleteProgram(headers, slug);
      if (res.statusCode < 300) await logAudit(event, "delete", "program", slug);
      return res;
    }
    if (method === "GET" && path === "/internal/stories") {
      return handleGetStories(headers);
    }
    if (method === "POST" && path === "/internal/stories") {
      const res = await handleCreateStory(event, headers);
      if (res.statusCode < 300) await logAudit(event, "create", "story", JSON.parse(res.body).slug);
      return res;
    }
    const blogStoryMatch = path.match(/^\/internal\/stories\/([^/]+)$/);
    if (method === "PUT" && blogStoryMatch) {
      const slug = decodeURIComponent(blogStoryMatch[1]);
      const res = await handleUpdateStory(event, headers, slug);
      if (res.statusCode < 300) await logAudit(event, "update", "story", withChanges(slug, res));
      return res;
    }
    if (method === "DELETE" && blogStoryMatch) {
      const slug = decodeURIComponent(blogStoryMatch[1]);
      const res = await handleDeleteStory(headers, slug);
      if (res.statusCode < 300) await logAudit(event, "delete", "story", slug);
      return res;
    }

    return json(404, headers, { error: "Not found" });
  }

  return json(404, headers, { error: "Not found" });
};
