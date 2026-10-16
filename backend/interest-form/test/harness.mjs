// In-memory stand-ins for the AWS services index.mjs talks to, so the handler can be exercised
// end to end without credentials, network access, or touching the live tables. The SDK client
// prototypes are patched *before* index.mjs is imported, so the clients it constructs at module
// load pick up the fakes.
//
// The DynamoDB fake evaluates the real ConditionExpression / UpdateExpression strings the
// handler sends (a small parser covering the subset this codebase uses), rather than
// pattern-matching on them — so a test of, say, the atomic RSVP capacity claim exercises the
// actual condition rather than a stub that always says yes.

import { readFileSync } from "node:fs";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SESClient } from "@aws-sdk/client-ses";
import { SSMClient } from "@aws-sdk/client-ssm";
import { S3Client } from "@aws-sdk/client-s3";

// The real table names, so grants can be looked up in iam-policy.json by name.
export const TABLES = {
  TABLE_NAME: "seads-interest-submissions",
  IMPACT_METRICS_TABLE: "seads-impact-metrics",
  STORY_SUBMISSIONS_TABLE: "seads-story-submissions",
  ADMIN_CONFIG_TABLE: "seads-admin-config",
  EVENTS_TABLE: "seads-events",
  AUDIT_LOG_TABLE: "seads-admin-audit-log",
  TEAM_TABLE: "seads-team",
  PARTNERS_TABLE: "seads-partners",
  PROGRAMS_TABLE: "seads-programs",
  STORIES_TABLE: "seads-stories",
  SITE_CONTENT_TABLE: "seads-site-content",
};

// Partition key per table, as in the real schema.
const KEY_ATTR = {
  [TABLES.TABLE_NAME]: "id",
  [TABLES.IMPACT_METRICS_TABLE]: "metricId",
  [TABLES.STORY_SUBMISSIONS_TABLE]: "id",
  [TABLES.ADMIN_CONFIG_TABLE]: "configId",
  [TABLES.EVENTS_TABLE]: "slug",
  [TABLES.AUDIT_LOG_TABLE]: "id",
  [TABLES.TEAM_TABLE]: "slug",
  [TABLES.PARTNERS_TABLE]: "slug",
  [TABLES.PROGRAMS_TABLE]: "slug",
  [TABLES.STORIES_TABLE]: "slug",
  [TABLES.SITE_CONTENT_TABLE]: "itemId",
};

// The fake enforces the Lambda role's actual DynamoDB grants, read straight from
// iam-policy.json. Without this the fake would happily serve calls the deployed role can't
// make — which is exactly how story-decision emails went unsent: the handler did a GetItem the
// role has never had, it failed with AccessDenied on every call in production, and a .catch
// swallowed it. Any code reaching for an ungranted action now fails the test suite instead.
const COMMAND_ACTION = {
  GetCommand: "dynamodb:GetItem",
  PutCommand: "dynamodb:PutItem",
  UpdateCommand: "dynamodb:UpdateItem",
  DeleteCommand: "dynamodb:DeleteItem",
  ScanCommand: "dynamodb:Scan",
};
const GRANTS = (() => {
  const policy = JSON.parse(readFileSync(new URL("../iam-policy.json", import.meta.url), "utf8"));
  const grants = new Map();
  for (const stmt of policy.Statement) {
    if (stmt.Effect !== "Allow") continue;
    const actions = [stmt.Action].flat();
    for (const resource of [stmt.Resource].flat()) {
      const match = /:table\/([^/]+)$/.exec(resource);
      if (!match) continue;
      const set = grants.get(match[1]) ?? new Set();
      actions.forEach((a) => set.add(a));
      grants.set(match[1], set);
    }
  }
  return grants;
})();

function assertGranted(commandName, tableName) {
  const action = COMMAND_ACTION[commandName];
  if (GRANTS.get(tableName)?.has(action)) return;
  const err = new Error(`User is not authorized to perform: ${action} on resource: table/${tableName}`);
  err.name = "AccessDeniedException";
  throw err;
}

export const state = {
  tables: new Map(),
  emails: [],
  ssm: new Map(),
  s3Deletes: [],
  turnstileSuccess: true,
};

export function resetState() {
  state.tables = new Map(Object.values(TABLES).map((t) => [t, new Map()]));
  state.emails = [];
  state.s3Deletes = [];
  state.turnstileSuccess = true;
  state.ssm = new Map([
    ["/seads/admin-session-secret", "test-session-secret-0123456789abcdef"],
    ["/seads/turnstile-secret-key", "test-turnstile-secret"],
  ]);
}

const clone = (v) => (v === undefined ? undefined : structuredClone(v));
const table = (name) => {
  const t = state.tables.get(name);
  if (!t) throw new Error(`Unknown table ${name}`);
  return t;
};
const keyOf = (name, key) => key[KEY_ATTR[name]];

export function seed(tableName, item) {
  table(tableName).set(item[KEY_ATTR[tableName]], clone(item));
}
export function getItem(tableName, key) {
  return clone(table(tableName).get(key));
}
export function allItems(tableName) {
  return [...table(tableName).values()].map(clone);
}

class ConditionalCheckFailedException extends Error {
  constructor() {
    super("The conditional request failed");
    this.name = "ConditionalCheckFailedException";
  }
}

// ---- expression evaluation --------------------------------------------------------------

function tokenize(expr) {
  const re = /\s*(<=|>=|<>|[(),=<>+-]|:[A-Za-z0-9_]+|#[A-Za-z0-9_]+|[A-Za-z_][A-Za-z0-9_.]*)/y;
  const tokens = [];
  let pos = 0;
  while (pos < expr.length && !/^\s*$/.test(expr.slice(pos))) {
    re.lastIndex = pos;
    const m = re.exec(expr);
    if (!m) throw new Error(`Cannot tokenize expression at offset ${pos}: ${expr}`);
    tokens.push(m[1]);
    pos = re.lastIndex;
  }
  return tokens;
}

function makeContext(input) {
  const names = input.ExpressionAttributeNames ?? {};
  const values = input.ExpressionAttributeValues ?? {};
  return {
    name: (tok) => (tok.startsWith("#") ? names[tok] : tok),
    value: (tok) => {
      if (!(tok in values)) throw new Error(`Missing expression value ${tok}`);
      return values[tok];
    },
  };
}

// Parses an operand: path | :value | if_not_exists(path, operand) | operand (+|-) operand.
function parseOperand(tokens, pos, ctx, item) {
  let [val, next] = parseAtom(tokens, pos, ctx, item);
  while (tokens[next] === "+" || tokens[next] === "-") {
    const op = tokens[next];
    const [rhs, after] = parseAtom(tokens, next + 1, ctx, item);
    val = op === "+" ? (val ?? 0) + rhs : (val ?? 0) - rhs;
    next = after;
  }
  return [val, next];
}

function parseAtom(tokens, pos, ctx, item) {
  const tok = tokens[pos];
  if (tok === "if_not_exists") {
    const path = ctx.name(tokens[pos + 2]);
    const [fallback, next] = parseOperand(tokens, pos + 4, ctx, item);
    return [item?.[path] !== undefined ? item[path] : fallback, next + 1];
  }
  if (tok.startsWith(":")) return [ctx.value(tok), pos + 1];
  return [item?.[ctx.name(tok)], pos + 1];
}

function evalCondition(expr, input, item) {
  if (!expr) return true;
  const tokens = tokenize(expr);
  const ctx = makeContext(input);
  let pos = 0;

  const parseOr = () => {
    let v = parseAnd();
    while (tokens[pos]?.toUpperCase() === "OR") {
      pos++;
      const rhs = parseAnd();
      v = v || rhs;
    }
    return v;
  };
  const parseAnd = () => {
    let v = parseNot();
    while (tokens[pos]?.toUpperCase() === "AND") {
      pos++;
      const rhs = parseNot();
      v = v && rhs;
    }
    return v;
  };
  const parseNot = () => {
    if (tokens[pos]?.toUpperCase() === "NOT") {
      pos++;
      return !parseNot();
    }
    return parsePrimary();
  };
  const parsePrimary = () => {
    const tok = tokens[pos];
    if (tok === "(") {
      pos++;
      const v = parseOr();
      pos++; // ')'
      return v;
    }
    if (tok === "attribute_exists" || tok === "attribute_not_exists") {
      const path = ctx.name(tokens[pos + 2]);
      pos += 4;
      const exists = item !== undefined && item[path] !== undefined;
      return tok === "attribute_exists" ? exists : !exists;
    }
    const [lhs, afterL] = parseOperand(tokens, pos, ctx, item);
    const op = tokens[afterL];
    const [rhs, afterR] = parseOperand(tokens, afterL + 1, ctx, item);
    pos = afterR;
    switch (op) {
      case "<": return lhs < rhs;
      case ">": return lhs > rhs;
      case "<=": return lhs <= rhs;
      case ">=": return lhs >= rhs;
      case "=": return lhs === rhs;
      case "<>": return lhs !== rhs;
      default: throw new Error(`Unsupported comparison ${op} in ${expr}`);
    }
  };

  const result = parseOr();
  if (pos !== tokens.length) throw new Error(`Unparsed condition tail in: ${expr}`);
  return result;
}

function applyUpdate(expr, input, item) {
  const ctx = makeContext(input);
  const updated = { ...item };
  // Split into SET / ADD / REMOVE clauses.
  const clauses = expr.split(/\b(SET|ADD|REMOVE)\b/i).map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < clauses.length; i += 2) {
    const kind = clauses[i].toUpperCase();
    const body = clauses[i + 1];
    if (kind === "SET") {
      // Assignments are comma-separated, but if_not_exists(a, b) contains commas too.
      const parts = [];
      let depth = 0;
      let start = 0;
      for (let j = 0; j < body.length; j++) {
        if (body[j] === "(") depth++;
        else if (body[j] === ")") depth--;
        else if (body[j] === "," && depth === 0) {
          parts.push(body.slice(start, j));
          start = j + 1;
        }
      }
      parts.push(body.slice(start));
      // Every right-hand side is evaluated against the *pre-update* item, as DynamoDB does.
      for (const part of parts) {
        const [lhs, rhs] = part.split(/=(.*)/s).map((s) => s.trim());
        const [val] = parseOperand(tokenize(rhs), 0, ctx, item);
        updated[ctx.name(lhs)] = val;
      }
    } else if (kind === "ADD") {
      for (const part of body.split(",")) {
        const [path, valTok] = part.trim().split(/\s+/);
        updated[ctx.name(path)] = (updated[ctx.name(path)] ?? 0) + ctx.value(valTok);
      }
    } else if (kind === "REMOVE") {
      for (const path of body.split(",")) delete updated[ctx.name(path.trim())];
    }
  }
  return updated;
}

// ---- service fakes ----------------------------------------------------------------------

async function fakeDynamo(command) {
  const name = command.constructor.name;
  const input = command.input;
  assertGranted(name, input.TableName);
  switch (name) {
    case "GetCommand":
      return { Item: clone(table(input.TableName).get(keyOf(input.TableName, input.Key))) };
    case "PutCommand": {
      const t = table(input.TableName);
      const k = input.Item[KEY_ATTR[input.TableName]];
      if (!evalCondition(input.ConditionExpression, input, t.get(k))) throw new ConditionalCheckFailedException();
      t.set(k, clone(input.Item));
      return {};
    }
    case "DeleteCommand": {
      const t = table(input.TableName);
      const k = keyOf(input.TableName, input.Key);
      if (!evalCondition(input.ConditionExpression, input, t.get(k))) throw new ConditionalCheckFailedException();
      t.delete(k);
      return {};
    }
    case "ScanCommand":
      return { Items: [...table(input.TableName).values()].map(clone) };
    case "UpdateCommand": {
      const t = table(input.TableName);
      const k = keyOf(input.TableName, input.Key);
      const before = t.get(k);
      if (!evalCondition(input.ConditionExpression, input, before)) throw new ConditionalCheckFailedException();
      const after = applyUpdate(input.UpdateExpression, input, { ...(before ?? {}), ...input.Key });
      t.set(k, after);
      if (input.ReturnValues === "ALL_OLD") return { Attributes: clone(before) };
      if (input.ReturnValues === "ALL_NEW" || input.ReturnValues === "UPDATED_NEW") return { Attributes: clone(after) };
      return {};
    }
    default:
      throw new Error(`Fake DynamoDB does not implement ${name}`);
  }
}

DynamoDBDocumentClient.prototype.send = fakeDynamo;

SESClient.prototype.send = async (command) => {
  const input = command.input;
  state.emails.push({
    to: input.Destination.ToAddresses,
    from: input.Source,
    subject: input.Message.Subject.Data,
    body: input.Message.Body.Text.Data,
  });
  return { MessageId: `fake-${state.emails.length}` };
};

SSMClient.prototype.send = async (command) => {
  const name = command.input.Name;
  if (!state.ssm.has(name)) {
    const err = new Error(`Parameter ${name} not found.`);
    err.name = "ParameterNotFound";
    throw err;
  }
  return { Parameter: { Name: name, Value: state.ssm.get(name) } };
};

S3Client.prototype.send = async (command) => {
  if (command.constructor.name === "DeleteObjectCommand") state.s3Deletes.push(command.input.Key);
  return {};
};

globalThis.fetch = async (url) => {
  if (String(url).includes("challenges.cloudflare.com")) {
    return { json: async () => ({ success: state.turnstileSuccess }) };
  }
  throw new Error(`Unexpected network call in tests: ${url}`);
};

// ---- loading the handler ----------------------------------------------------------------

for (const [envName, tableName] of Object.entries(TABLES)) process.env[envName] = tableName;
process.env.MEDIA_BUCKET = "test-media";
process.env.AWS_REGION = "ap-southeast-1";
process.env.NOTIFY_EMAIL = "team@example.org";
process.env.SITE_URL = "https://seads.test";
process.env.ALLOWED_ORIGINS = "https://seads.test";

resetState();
const { handler } = await import("../index.mjs");

let ipCounter = 0;
// Each call gets its own source IP by default so per-IP rate limits don't leak between tests;
// pass `ip` explicitly to test those limits.
export async function call(method, path, { body, token, ip } = {}) {
  const res = await handler({
    rawPath: path,
    requestContext: { http: { method, sourceIp: ip ?? `203.0.113.${(ipCounter++ % 250) + 1}` } },
    headers: { origin: "https://seads.test", ...(token ? { "x-admin-token": token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : null };
}

// Seeds an admin password and logs in through the real endpoint, returning a session token.
export async function seedAdminAndLogin(password = "correct horse battery staple") {
  const { scryptSync, randomBytes } = await import("node:crypto");
  const salt = randomBytes(16).toString("hex");
  seed(TABLES.ADMIN_CONFIG_TABLE, {
    configId: "password",
    salt,
    hash: scryptSync(password, salt, 64).toString("hex"),
    updatedAt: new Date().toISOString(),
  });
  const res = await call("POST", "/admin-login", { body: { password } });
  if (res.status !== 200) throw new Error(`Test login failed: ${JSON.stringify(res)}`);
  return res.body.token;
}

// "DD Mon YYYY", the format the admin panel stores, `daysFromToday` away in Singapore time.
export function eventDate(daysFromToday) {
  const d = new Date(Date.now() + daysFromToday * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", day: "numeric", month: "short", year: "numeric" }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get("day")} ${get("month").slice(0, 3)} ${get("year")}`;
}
