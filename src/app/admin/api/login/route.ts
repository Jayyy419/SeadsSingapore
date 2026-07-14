import { NextResponse } from "next/server";
import { API_BASE_URL, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/admin-session";

// Thin, secret-free proxy to the interest-form Lambda's POST /admin-login — see
// docs/LEARNING_GUIDE.md for why the password check itself doesn't happen here. Called via
// fetch() from the login page's client-side form handler, not a native <form> POST — a native
// submission is governed by the CSP's form-action directive, which was blocking the login
// form in production for reasons not fully pinned down without direct production access.
// A fetch() POST is governed by connect-src instead, which is already known-correct.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  const lambdaRes = await fetch(`${API_BASE_URL}/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!lambdaRes.ok) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const { token } = await lambdaRes.json();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
