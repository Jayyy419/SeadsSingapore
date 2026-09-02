// Amplify Hosting's environment variables for this app never reliably reach the deployed
// SSR compute's process.env at request time (confirmed via a temporary diagnostic endpoint —
// see docs/LEARNING_GUIDE.md), so no admin secret lives here anymore. Session tokens are
// created and verified entirely by the interest-form Lambda (backend/interest-form/index.mjs,
// POST /admin-login and POST /verify-session), whose own environment variables have worked
// reliably all session via a completely different mechanism. This file now only holds the
// cookie name/lifetime constants both sides need to agree on.
export const SESSION_COOKIE = "seads_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours — must match the Lambda's value

// The interest-form API's base URL isn't actually secret — it's the same URL already exposed
// via NEXT_PUBLIC_INTEREST_FORM_ENDPOINT — so hardcoding it as a plain fallback constant here
// is fine and sidesteps relying on any env var reaching server runtime at all.
export const API_BASE_URL = process.env.INTERNAL_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

// Cheap, local, offline check that a session cookie is *present and unexpired* — deliberately
// NOT an authentication check, because verifying the HMAC needs the signing key and no secret
// lives in this app (see the note above).
//
// This replaced a per-request `fetch` to the Lambda's POST /verify-session. That call was made
// from proxy.ts (Next's middleware) on every single /admin/* request, and it had two problems:
//
//  1. It failed closed on *any* error — including a network failure — via a bare `catch`
//     returning false. On 2026-09-01 that fetch began failing instantly inside the middleware
//     runtime, so every admin request redirected to /admin/login and the whole panel became
//     unreachable, with nothing logged anywhere to say why. An infrastructure failure must not
//     be indistinguishable from "you are not logged in".
//  2. It put a full round-trip (~1s measured) in front of every admin navigation.
//
// Dropping the signature check *here* costs nothing real, because middleware was never the
// security boundary: every actual read and write goes through internalApiFetch to the Lambda's
// /internal/* routes, which call requireValidAdminToken and verify the HMAC server-side before
// touching any data. A forged or tampered cookie therefore gets past this gate but still cannot
// read or change anything — it just gets 401s, which internalApiFetch turns back into a login
// redirect. What this gate is for is the UX job of not showing admin chrome to a logged-out
// visitor, and for that, presence-and-expiry is exactly the right question to ask.
export function hasUnexpiredSessionCookie(token: string | undefined): boolean {
  if (!token) return false;

  // Mirrors the Lambda's own token shape: `${expiresAtMs}.${hmacSha256Hex}`.
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!/^[0-9a-f]{64}$/.test(signature)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() < expiresAt;
}
