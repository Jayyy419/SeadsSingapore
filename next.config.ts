import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// next/font/google self-hosts fonts at build time (no runtime request to Google's CDN), so
// the external runtime origins this site actually talks to are: Vercel's analytics collector,
// Cloudflare Turnstile (the "Get Involved" form's bot check — script, its own iframe, and its
// verification calls), Sentry's error-ingest endpoint (region/org subdomain varies, hence
// the wildcard; tighten to the exact host once NEXT_PUBLIC_SENTRY_DSN is set for real), and
// the interest-form API Gateway (submissions, plus the public impact-metrics/community-stories/
// event-rsvp-counts reads it now also serves) — this origin was missing from connect-src
// entirely until caught by a real-browser Playwright check, which silently blocked every one
// of those fetches with a CSP violation despite them working fine via curl/server-side calls.
const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} https://vitals.vercel-insights.com https://va.vercel-scripts.com https://challenges.cloudflare.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io`,
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// withSentryConfig no-ops sensibly if there's no auth token/org/project configured (source
// map upload just gets skipped) — safe to always wrap, not conditional on a DSN existing.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
