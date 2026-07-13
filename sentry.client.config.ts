import * as Sentry from "@sentry/nextjs";

// Same pattern as Turnstile/the interest-form endpoint elsewhere in this codebase: if the DSN
// isn't set, this simply doesn't initialize rather than throwing or logging noise.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}
