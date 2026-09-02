import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL, SESSION_COOKIE } from "@/lib/admin-session";

// Server-only. Calls the interest-form Lambda's /internal/* endpoints, which the admin
// panel's own Route Handlers/Server Actions use to reach DynamoDB — the Amplify Next.js
// compute has no IAM role of its own (see docs/LEARNING_GUIDE.md), so this proxies through
// the Lambda instead, which already has the right table permissions. Never called from the
// browser directly. Forwards the caller's own admin session cookie as the auth token — the
// Lambda verifies it itself (POST /verify-session logic reused inline), so there's no
// separate static server-to-server key to keep in sync.
export async function internalApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...init?.headers, "X-Admin-Token": token, "Content-Type": "application/json" },
    cache: "no-store",
  });

  // The Lambda is the real authorization boundary (proxy.ts only checks that a cookie exists
  // and hasn't expired — see hasUnexpiredSessionCookie). So a 401 here is the authoritative
  // "this session isn't valid", and the right response is to send the admin back to the login
  // page rather than let the caller render an empty list or throw a raw "failed: 401", which
  // would look like data loss or a broken page instead of a finished session.
  if (res.status === 401) {
    redirect("/admin/login");
  }

  return res;
}
