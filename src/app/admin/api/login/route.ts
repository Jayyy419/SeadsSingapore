import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/admin-session";

// Plain <form method="POST"> submission, no client JS required for login itself.
// Note on brute force: there's deliberately no rate limiting here — the shared password is a
// long random value (~120 bits of entropy), not a memorable phrase, so throttling attempts
// wouldn't meaningfully add security. See docs/LEARNING_GUIDE.md.
export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  const adminPassword = process.env.ADMIN_PASSWORD;

  const url = new URL(request.url);

  if (!adminPassword || password !== adminPassword) {
    url.pathname = "/admin/login";
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 303);
  }

  const token = await createSessionToken();
  url.pathname = "/admin";
  url.search = "";
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
