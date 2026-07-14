import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin-session";

export async function POST(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/admin/login";
  url.search = "";
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(SESSION_COOKIE, "", { path: "/", httpOnly: true, secure: true, sameSite: "strict", maxAge: 0 });
  return response;
}
