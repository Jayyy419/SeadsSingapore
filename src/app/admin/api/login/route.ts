import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, hasUnexpiredSessionCookie } from "@/lib/admin-session";

// Second half of signing in. The login page sends the password straight to the Lambda's
// POST /admin-login from the browser (so the Lambda's rate limit sees each visitor's own IP —
// see src/app/admin/login/page.tsx), and posts the token it gets back here, because only the
// server can set an httpOnly cookie. The password never reaches this app.
//
// The token isn't verified here — no signing key lives in this app (see admin-session.ts) —
// and it doesn't need to be: the Lambda verifies it on every /internal/* call, so a made-up
// token gets its holder nothing but 401s. This only rejects things that aren't token-shaped.
//
// Requiring a JSON body means a cross-site page can't post here without a CORS preflight,
// which this route doesn't answer.
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ ok: false }, { status: 415 });
  }
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : undefined;
  if (!token || !hasUnexpiredSessionCookie(token)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

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
