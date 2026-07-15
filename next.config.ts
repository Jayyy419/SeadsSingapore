import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Admin-uploaded Team/Partners/Programs/Stories photos live in this S3 bucket — needed so
    // next/image is allowed to fetch and optimize them (see src/lib/security-headers.ts for the
    // matching CSP img-src entry).
    remotePatterns: [{ protocol: "https", hostname: "seads-media.s3.ap-southeast-1.amazonaws.com" }],
  },
};

// withSentryConfig no-ops sensibly if there's no auth token/org/project configured (source
// map upload just gets skipped) — safe to always wrap, not conditional on a DSN existing.
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
