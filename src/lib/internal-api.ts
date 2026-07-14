import { cookies } from "next/headers";
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

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...init?.headers, "X-Admin-Token": token, "Content-Type": "application/json" },
    cache: "no-store",
  });
}
