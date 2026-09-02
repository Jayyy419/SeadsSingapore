import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, hasUnexpiredSessionCookie } from "@/lib/admin-session";
import { securityHeaders } from "@/lib/security-headers";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/api/login", "/admin/api/logout"];

// next.config.ts's headers() applies to normal page responses, but responses proxy.ts (Next's
// middleware) returns directly — like the redirect below — don't reliably pick those up. Set
// them explicitly here too so every /admin/* response, including this one, always carries the
// same CSP; without it a same-origin form POST here (e.g. /admin/login's own login form) can
// get blocked by the browser's own default/absent CSP with a "violates form-action" error.
function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const header of securityHeaders) {
    response.headers.set(header.key, header.value);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  // Presence-and-expiry only, evaluated locally — see hasUnexpiredSessionCookie for why this
  // deliberately doesn't verify the signature, and why doing so here used to take the entire
  // admin panel down. Real authorization happens in the Lambda on every /internal/* call.
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!hasUnexpiredSessionCookie(token)) {
      const loginUrl = new URL("/admin/login", request.url);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*"],
};
