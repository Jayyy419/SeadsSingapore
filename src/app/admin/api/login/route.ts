import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/admin-session";

// Called via fetch() from the login page's client-side form handler, not a native <form>
// POST — a native submission is governed by the CSP's form-action directive, which (for
// reasons not fully pinned down without direct production access — see
// docs/LEARNING_GUIDE.md) was blocking the login form in production despite being same-origin.
// A fetch() POST is governed by connect-src instead, which is already known-correct.
//
// No login rate limiting: the shared password is a long random value (~120 bits of entropy),
// not a memorable phrase, so throttling attempts wouldn't meaningfully add security.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  // Trimmed on both sides — copying the password out of the Amplify console's env var field
  // (or pasting it anywhere) can easily pick up a trailing space/newline; trimming a random
  // string like this costs no real security margin.
  const password = typeof body?.password === "string" ? body.password.trim() : body?.password;
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
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
