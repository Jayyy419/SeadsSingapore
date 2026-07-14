import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin-session";

// Called via fetch() from AdminLogoutButton, not a native <form> POST — see login/route.ts.
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", httpOnly: true, secure: true, sameSite: "strict", maxAge: 0 });
  return response;
}
