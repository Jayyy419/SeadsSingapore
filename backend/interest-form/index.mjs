import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { randomUUID } from "node:crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});
const secretsManager = new SecretsManagerClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").filter(Boolean);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const INTEREST_TYPES = new Set(["volunteer", "partner", "event", "other"]);
const INTEREST_TYPE_LABELS = { volunteer: "Volunteering", partner: "Partnering", event: "Attending an event", other: "Other" };

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

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };

  const method = event.requestContext?.http?.method;

  if (method === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (method === "GET" && event.rawPath === "/health") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 200) : "";
  const email = typeof payload.email === "string" ? payload.email.trim().slice(0, 200) : "";
  const interest = typeof payload.interest === "string" ? payload.interest.trim().slice(0, 1000) : "";
  const interestType = INTEREST_TYPES.has(payload.interestType) ? payload.interestType : "";

  if (!name || !isValidEmail(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "name and a valid email are required" }) };
  }

  const remoteIp = event.requestContext?.http?.sourceIp;
  const [ipOk, emailOk] = await Promise.all([
    remoteIp ? checkRateLimit(`ip#${remoteIp}`, 5) : true,
    checkRateLimit(`email#${email.toLowerCase()}`, 3),
  ]);
  if (!ipOk || !emailOk) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: "Too many submissions — please try again in a few minutes." }) };
  }

  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
  if (!(await verifyTurnstile(turnstileToken, remoteIp))) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Could not verify you're not a bot. Please try again." }) };
  }

  const submittedAt = new Date().toISOString();
  const id = randomUUID();

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { id, name, email, interest, interestType, submittedAt },
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

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
