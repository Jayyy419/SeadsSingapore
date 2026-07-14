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

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/verify-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
