// Shared by next.config.ts (headers() — applies to normal page/API responses) and proxy.ts
// (applies explicitly to responses proxy.ts itself returns, e.g. the /admin/login redirect,
// which next.config.js's headers() doesn't reliably reach — see docs/LEARNING_GUIDE.md).
const apiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";
// The admin image-upload flow PUTs a file directly from the browser to this S3 bucket via a
// presigned URL (see AdminImageUpload / POST /internal/uploads), and uploaded photos are then
// rendered as plain <img src="https://...s3.../..."> both in admin previews and public pages —
// both need explicit CSP allowances, caught by an actual browser blocking it silently (curl
// can't see CSP violations at all — same lesson as the interest-form API origin bug earlier).
const mediaOrigin = "https://seads-media.s3.ap-southeast-1.amazonaws.com";

export const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${mediaOrigin}`,
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} ${mediaOrigin} https://challenges.cloudflare.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io`,
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const securityHeaders: { key: string; value: string }[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
];
