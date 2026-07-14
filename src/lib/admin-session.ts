// Uses Web Crypto (available in both the Node.js and Edge runtimes) rather than node:crypto,
// since this needs to run inside middleware.ts — which executes on the Edge runtime, where
// node:crypto's createHmac/timingSafeEqual aren't available.

const SESSION_COOKIE = "seads_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await hmacHex(secret, payload)}`;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await hmacHex(secret, payload);
  if (!timingSafeEqual(signature, expected)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
