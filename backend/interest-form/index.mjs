import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { randomUUID } from "node:crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});
const secretsManager = new SecretsManagerClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const IMPACT_METRICS_TABLE = process.env.IMPACT_METRICS_TABLE;
const STORY_SUBMISSIONS_TABLE = process.env.STORY_SUBMISSIONS_TABLE;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Internal-Key",
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

function requireInternalAuth(event) {
  const provided = event.headers?.["x-internal-key"] || event.headers?.["X-Internal-Key"];
  return Boolean(INTERNAL_API_KEY) && provided === INTERNAL_API_KEY;
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

async function handleGetSubmissions(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = (result.Items || [])
    .filter((item) => !String(item.id).startsWith("ratelimit#"))
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  return json(200, headers, { submissions: items });
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

async function handleGetApprovedStories(headers) {
  const result = await ddb.send(new ScanCommand({ TableName: STORY_SUBMISSIONS_TABLE }));
  const items = (result.Items || [])
    .filter((item) => item.status === "approved")
    .sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""))
    .map((item) => ({ id: item.id, authorName: item.authorName, title: item.title, body: item.body, submittedAt: item.submittedAt }));
  return json(200, headers, { stories: items });
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

  // Everything else under /internal/* is server-to-server only, called from the Next.js
  // admin panel's own Route Handlers (never the browser directly) — protected by a shared
  // key rather than the end-user's session, since this Lambda has no concept of that session.
  if (path.startsWith("/internal/")) {
    if (!requireInternalAuth(event)) {
      return json(401, headers, { error: "Unauthorized" });
    }

    if (method === "GET" && path === "/internal/impact-metrics") {
      return handleGetImpactMetrics(headers);
    }
    const metricMatch = path.match(/^\/internal\/impact-metrics\/([^/]+)$/);
    if (method === "PUT" && metricMatch) {
      return handleUpdateImpactMetric(event, headers, decodeURIComponent(metricMatch[1]));
    }
    if (method === "GET" && path === "/internal/submissions") {
      return handleGetSubmissions(headers);
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

    return json(404, headers, { error: "Not found" });
  }

  return json(404, headers, { error: "Not found" });
};
