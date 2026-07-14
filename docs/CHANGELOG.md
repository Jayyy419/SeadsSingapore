# Changelog

All notable changes to this project should be documented in this file.

This format is inspired by Keep a Changelog and uses a date-based release style.

## [2026-07-14] (20)

### Fixed — admin auth moved off Amplify env vars entirely (root cause found)

The real root cause of every admin-login symptom this session (CSP violation, then
"Incorrect password" with the actually-correct password): **Amplify Hosting's environment
variables for this app never reliably reach the deployed Next.js SSR compute's `process.env`
at request time**, regardless of value, regardless of being set at app level or branch level,
and regardless of attaching both an `iamServiceRoleArn` and a `computeRoleArn` (both now
attached — `seads-amplify-service-role`, trusted by `amplify.amazonaws.com`, policy
`AdministratorAccess-Amplify`). Confirmed with a temporary diagnostic endpoint
(`/admin/api/debug-env`, now removed) that reported every server-only var as unset even
immediately after a fresh deploy with correct app config. `aws ssm get-parameters-by-path`
under Amplify's expected `/amplify/<appId>/<branch>/` prefix returned zero results throughout
— the app-level config the AWS API reports back is never actually synced anywhere the running
compute can read it. `NEXT_PUBLIC_*` variables were never affected by this, since those are
resolved to literal strings in client bundles at *build* time (a completely different
mechanism from server-runtime `process.env`), which is also why nothing else broke visibly —
every server-side env var read elsewhere in the app happened to have a fallback matching the
real value.

Fix: stopped depending on Amplify env vars for anything security-sensitive. Moved
`ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to the interest-form Lambda's own environment
variables instead — which *have* worked reliably all session via a completely different,
well-established mechanism (`aws lambda update-function-configuration`). The Lambda gained
`POST /admin-login` (password → signed session token) and `POST /verify-session` (token →
valid/invalid), both intentionally public/unauthenticated since neither can be used to forge
or discover a valid token without already knowing the password. `/internal/*` routes now
require a valid session token (`X-Admin-Token` header) instead of the old static
`INTERNAL_API_KEY`, tying data-access authorization directly to being logged in rather than a
separate shared secret. The Next.js side (`src/lib/admin-session.ts`, `src/proxy.ts`,
`src/lib/internal-api.ts`, `src/app/admin/api/login/route.ts`) is now a thin, secret-free
proxy — verified by rebuilding and running the full login → dashboard → logout flow locally
with **zero** admin-related environment variables set at all, matching exactly what
production has (nothing), and it worked.

## [2026-07-14] (19)

### Fixed — "Incorrect password" with the correct password

After the `fetch()` fix, login reached the server correctly but still rejected the actual
`ADMIN_PASSWORD` value copied from the Amplify console. Most likely cause: a stray
space/newline picked up when copying the value out of the console's text field — the
comparison was a strict `===` with no normalization. Now trims both sides
(`src/app/admin/api/login/route.ts`) before comparing; verified locally that a
deliberately whitespace-padded password now succeeds while a genuinely wrong one still
correctly fails.

## [2026-07-14] (18)

### Fixed — admin login, for real this time

The previous entry's fix (explicit headers in `proxy.ts`) didn't resolve it in production —
same `form-action 'self'` violation on the same-origin login POST, confirmed still happening
after that deploy. Rather than keep guessing at *why* a same-origin form-action check was
failing without direct access to the production environment to inspect it, sidestepped the
directive entirely: `/admin/login` and the logout button now submit via `fetch()`
(`src/app/admin/login/page.tsx`, `src/components/admin-logout-button.tsx`) instead of a
native `<form method="POST">`. A `fetch()` POST is governed by the CSP's `connect-src`
directive, not `form-action` — and `connect-src` was already confirmed correct via the
earlier Playwright check. The login/logout Route Handlers changed from returning redirects to
plain JSON responses (`{ ok: true }` + Set-Cookie), with the client doing a full
`window.location.href` navigation afterward so `proxy.ts` re-evaluates with the fresh cookie.
Verified end-to-end with Playwright driving a real Chromium browser through login → dashboard
→ logout → redirected back to login, with zero console errors.

## [2026-07-14] (17)

### Fixed — admin login blocked by its own CSP in production

Reported: clicking "Log in" on `/admin/login` did nothing. Browser DevTools showed:
`Sending form data to '.../admin/api/login' violates the following Content Security Policy
directive: "form-action 'self'"` — on a same-origin form, which `'self'` should always permit.
Root cause not fully provable without direct production access, but the likely explanation is
that `next.config.ts`'s `headers()` doesn't reliably apply to responses that also pass through
`proxy.ts` (Next's middleware) in this Next.js version. Fixed defensively rather than chasing
the exact mechanism further: extracted the security headers into `src/lib/security-headers.ts`
and now set them explicitly on every response `proxy.ts` returns (the login/logout redirect
included), not just relying on `next.config.ts`. Verified locally that `/admin/login`, the
`/admin` → `/admin/login` redirect, and a normal page all carry the identical, correct header.

## [2026-07-14] (16)

### Added — custom admin panel

The site had no way to manage content short of editing `siteContent.ts` and redeploying.
Added a password-gated `/admin` section:

- **Auth**: a single shared password (`ADMIN_PASSWORD`, an Amplify env var) checked in
  `src/app/admin/api/login/route.ts`, which sets an HttpOnly/Secure/SameSite=Strict cookie
  containing an HMAC-signed, expiring session token (`src/lib/admin-session.ts`).
  `src/proxy.ts` (Next.js's renamed `middleware.ts` convention) gates every `/admin/*` route
  except the login/logout endpoints themselves. Deliberately no rate limiting on login — the
  password is a ~120-bit random value, not a memorable phrase, so brute force isn't a
  realistic concern; a memorable password would need one.
- **Data layer**: since Amplify's Next.js SSR compute has no IAM role of its own
  (`computeRoleArn` is unset — confirmed via `aws amplify get-app`), the admin panel's own
  Route Handlers/Server Actions proxy to the *interest-form Lambda* instead of talking to
  DynamoDB directly (`src/lib/internal-api.ts`, `backend/interest-form/index.mjs`'s new
  `/internal/*` routes, gated by a separate server-to-server `INTERNAL_API_KEY`, distinct from
  the admin's own session). Two new DynamoDB tables: `seads-impact-metrics`,
  `seads-story-submissions` (both PITR-enabled).
- **Impact metrics**: homepage's 4 stat tiles are now admin-editable and read live from
  DynamoDB via a public `GET /impact-metrics` (read-only, no key needed — same reasoning as
  the community-stories endpoint below) with a static-fallback client hook so the homepage
  never shows nothing while the fetch is in flight.
- **Live event RSVP counts**: interest-form submissions can now carry an `eventSlug`; a
  public `GET /event-rsvp-counts` computes real per-event counts, replacing the
  manually-maintained `spotsFilled` field added earlier today (kept as a fallback value only).
- **Submissions viewer** and **story moderation queue** (approve/reject community-submitted
  stories via `/blog/submit`, itself Turnstile+rate-limited like the interest form) round out
  the admin dashboard.

### Fixed — CSP never allowed the interest-form API origin

A real-browser Playwright check (not just curl) caught that `next.config.ts`'s
`connect-src` never included the interest-form API Gateway's origin — every fetch to it,
including the original "Get Involved" form submission itself, was likely being silently
blocked by the browser's own CSP enforcement in production this whole time. Fixed by adding
the origin (derived from `NEXT_PUBLIC_API_BASE_URL`) to `connect-src`. A reminder that
`curl`/server-side testing can't catch CSP violations — only a real browser can.

### Fixed — admin pages could break the CI build entirely

The 4 admin pages that fetch live data (`/admin/impact-metrics`, `/admin/events`,
`/admin/submissions`, `/admin/stories`) have no dynamic route segments, so Next.js tried to
statically prerender them at build time by default — which called `internalApiFetch()`
during `npm run build`, throwing because `INTERNAL_API_KEY` isn't (and shouldn't be) set in
CI. Added `export const dynamic = "force-dynamic"` to each; verified by rebuilding with the
exact CI environment (no server secrets) locally before pushing.

## [2026-07-14] (15)

### Security

- **GitHub secret scanning, push protection, and Dependabot security updates enabled**
  (repo is public, so these are free) via the repo settings API, plus a `gitleaks` GitHub
  Action (`.github/workflows/gitleaks.yml`) as a CI-level backstop that doesn't depend on
  GitHub's own scanner. Confirmed via a full `git log --all -p` scan that no credential
  pasted into chat this session ever actually landed in a commit.
- **Branch protection on `main`**: force-pushes and branch deletion now hard-blocked for
  everyone; merges require the `build` CI check. `enforce_admins` is left off so the repo
  owner can still push directly, matching the existing workflow — flagged as a deliberate
  choice, not an oversight, since flipping it on would require routing every change through
  a PR with no second reviewer available.
- **`.github/dependabot.yml`** added for the Next.js app, the Lambda's own `package.json`,
  and GitHub Actions versions.
- **`/.well-known/security.txt`** (RFC 9116) added as a Next.js Route Handler (not a static
  file) so its `Canonical` URL stays correct via the same `NEXT_PUBLIC_SITE_URL` fallback
  pattern as `sitemap.ts`/`robots.ts`.
- **Per-IP/email rate limiting on the interest-form Lambda.** API Gateway's own throttle
  (5 rps / burst 10) is global across every caller — AWS WAF can't attach to HTTP APIs (see
  the "Why WAF turned out not to apply here" section of `LEARNING_GUIDE.md`), so there was
  no per-caller limit underneath it. Added a DynamoDB-backed fixed-window counter (10-minute
  buckets, 5/window per IP, 3/window per email) using `UpdateCommand`'s
  `ADD #count :incr` on an ordinary item in the same table, cleaned up via TTL (now enabled
  on the table's `ttl` attribute). Requires `dynamodb:UpdateItem` on the Lambda's execution
  role — the deploy pipeline only pushes code, not IAM policy, so this needs a manual
  `aws iam put-role-policy` run once with admin credentials (documented in
  `backend/interest-form/iam-policy.json`).

### Added — event capacity/waitlist, calendar/RSS feeds, WhatsApp, QR codes

- `EventItem` gained optional `capacity`/`spotsFilled` fields. When set, listing and detail
  pages show "X / Y spots filled" or a "Waitlist — event full" state that also relabels the
  RSVP form's button/heading. Manually maintained for now — real RSVP counts aren't tracked
  yet (see the open admin/CMS question in this same entry).
- Locale now auto-detects from `navigator.languages` on first visit (matching against the
  four supported locales by 2-letter prefix) instead of always defaulting to English —
  only when there's no stored `seads-locale` preference yet, so it never overrides an
  explicit choice.
- `/events/calendar.ics` — a single subscribable feed of every event (English-only; feeds
  have no per-viewer locale). `/blog/rss.xml` similarly for stories, with RSS auto-discovery
  wired into `/blog`'s metadata.
- WhatsApp deep links (`wa.me`) added alongside the existing form on event RSVP, program
  apply, and the contact page — the org's WhatsApp number lives in one place
  (`src/lib/whatsapp.ts`) so it's a one-line change if it's updated.
- Downloadable QR codes (`/events/[slug]/qr`, `/programs/[slug]/qr`, generated server-side
  via the `qrcode` package, no external QR API call — keeps this within the existing CSP's
  `img-src 'self' data:`) encoding a UTM-tagged URL (`utm_source=qr&utm_medium=print`) so
  scans from physical events/print materials show up distinctly in analytics.

### Known gap — no admin/CMS layer yet

Several of the above (live capacity counts, and the larger backlog item of live impact
metrics, volunteer certificates, and community-submitted stories) all need some
admin-managed data layer and auth that doesn't exist yet — the site is still fully static
content in `siteContent.ts`, hand-edited and redeployed via git. This is an open
architecture question, not an oversight; see the conversation/next entry once resolved.

## [2026-07-14] (14)

### Fixed — sitemap missing every detail page

`src/app/sitemap.ts` only ever listed the static top-level routes. Adding
`/blog/[slug]`, `/events/[slug]`, and `/programs/[slug]` in earlier work never
updated it, so all 23 detail pages were fully built and crawlable but absent
from `sitemap.xml` — invisible to search engines despite being real, linked
pages. Sitemap now derives the detail routes directly from `programs`,
`events`, and `stories` in `siteContent.ts`, so new content is picked up
automatically instead of needing a second manual edit.

### Added — event/program detail page QOL

- `/events/[slug]` and `/programs/[slug]` now have a "back to all ___" link,
  matching the pattern `/blog/[slug]` already had. Previously the only way
  back from a detail page was the browser back button.
- `/events/[slug]` now has an "Add to calendar" link that downloads a real
  `.ics` file (`src/lib/ics.ts`) for the event — an all-day event on the
  listed date, since the content model only stores a date, not a time.
  Parses the site's fixed `"DD Mon YYYY"` date format directly rather than
  relying on `Date` constructor string leniency, which isn't guaranteed
  consistent across browsers.

## [2026-07-13] (13)

### Added — full site localization

Previously the EN/中文/BM/HI locale switcher (prominent on every page) only ever translated
the homepage's body text and a handful of nav labels — every subpage, and most of the nav
chrome, stayed in English regardless of selection. Extended the existing client-side
mechanism (React state + `localStorage`, no URL/route changes — a deliberate scope decision;
see `docs/LEARNING_GUIDE.md` Part 11 for the tradeoff against proper `/en/`/`/zh/` URL-based
i18n) to cover the whole site:

- New `LocaleProvider`/`useLocale()` (`src/lib/locale-context.tsx`) — a shared context so
  every page, not just the homepage, can read/set the current locale. `SiteHeader` no longer
  owns locale state itself; `SiteShell`'s footer is now locale-aware too.
- Every subpage split into a Server Component `page.tsx` (keeps `metadata`/
  `generateStaticParams`, which can't coexist with `"use client"`) rendering a Client
  Component that does the actual translated rendering — `about/about-content.tsx`,
  `team/team-content.tsx`, etc., following the same pattern throughout.
- `src/content/siteContent.ts` restructured so every program/event/story/team-bio/
  testimonial/impact-metric field is a `LocalizedString` (`Record<Locale, string>`) instead
  of a plain string — real translated content for all of it, not just UI chrome.
- `src/content/i18n.ts` expanded from ~40 to ~150 keys covering every page's headings,
  labels, and CTAs.
- `InterestForm`'s interest-type dropdown and status messages are now translated; the
  Privacy page's mailto/Cloudflare links stay real, clickable links across all four
  languages via a small `linkify()` helper (translated sentences contain the untranslated
  email address / brand name as a literal substring, split around it).

**Caveat, same spirit as the Privacy Policy's:** these are real, careful translations, not
placeholder text — verified end-to-end across all four locales in this session (nav, forms,
dynamic detail pages, persistence across navigation). But this session isn't a native speaker
of Mandarin, Malay, or Hindi; a native-speaker review is worth doing before treating the
non-English copy as final, same as the Privacy Policy.

**Known limitation (accepted as part of the architecture choice):** non-English content is
not crawlable by search engines — Google only ever sees the English version, since there's
no separate URL per locale. Revisit with proper `/[locale]/` routing if multi-language SEO
becomes a priority.

## [2026-07-13] (12)

### Fixed — feature-level dead ends and non-functional UI

A survey of every content page turned up several instances of the same problem: a page
promising an interaction (a link, a described next step) that didn't actually exist.

- **`/join` was circular and had no form.** Its own copy described "submit your interest
  details" as step 2, but the page had no form — just a link to `/events`, which linked back
  to `/join`. Fixed by extracting the interest form into a reusable
  `src/components/interest-form.tsx` and embedding it directly on `/join` (and reusing it on
  every new detail page below), instead of the form only ever existing on the homepage.
- **Story cards on `/blog` weren't clickable at all**, and no story detail page existed
  anywhere in the site. Added `/blog/[slug]` with full story bodies; cards now link through.
- **Program cards weren't clickable either.** Added `/programs/[slug]` with full program
  detail, a "who it's for" callout, and an Apply CTA pre-filled with that program.
- **Every event's "Join" button led to the same generic form**, losing which event you
  wanted. Added `/events/[slug]` with an RSVP form pre-filled with that specific event
  (`prefillInterest`/`prefillInterestType` props on the shared form component).
- **The header's primary CTA button was "Donate," linking to a "coming soon" dead end**, on
  every single page. Changed to "Get Involved" → `/join`; Donate remains reachable from every
  footer, just no longer the site's top-billed action.

### Added

- Structured `interestType` field (Volunteering / Partnering / Attending an event / Other)
  alongside the existing free-text field — threaded through the form component, the Lambda
  (allow-list validated, never trusting the raw client value), DynamoDB, and the notification
  email subject line, so Seads staff can triage submissions without reading every one.
- Team member bios on `/team` (previously name + role only).
- A "Become a partner" CTA on `/partners` (previously static description cards with no next
  step).
- Extended `src/content/siteContent.ts` with `slug`/`body` fields on programs, events, and
  stories to support the new detail pages — all placeholder content, consistent with the
  rest of this project's demo data (see `docs/ARCHITECTURE.md`), not claims about real Seads
  activities.

## [2026-07-13] (11)

### Added

- Privacy Policy page (`src/app/privacy`), linked from both footers and added to the
  sitemap. Site collects name/email/message via the "Get Involved" form with zero privacy
  disclosure until now — a real gap for an org collecting personal data, not just polish.
  Content is grounded only in what's factually true about how this system actually works
  today (what's collected, that there are no cookies, where data is stored, that Cloudflare/
  Sentry are named as processors) — nothing fabricated (no invented retention period, no
  named Data Protection Officer). **This should still get a human review from whoever runs
  Seads before being treated as final** — it's an honest, working draft, not legal advice.

### Known gap surfaced while writing this

- DynamoDB has no TTL/automatic-deletion configured on `seads-interest-submissions` —
  submissions are retained indefinitely until someone manually deletes them. The privacy
  policy is worded to match this honestly ("kept for as long as reasonably needed... or
  until you ask us to delete it") rather than promising an automatic retention period that
  doesn't actually exist yet. Worth deciding on and implementing a real TTL later if Seads
  wants automatic expiry.

## [2026-07-13] (10)

### Fixed — production bug

- **The Content-Security-Policy never allowed `challenges.cloudflare.com`**, so every real
  visitor's browser has been silently blocking the Turnstile script since it shipped (2026-07-13
  (5)) — the widget never rendered, no token was ever sent, and every genuine form submission
  would have been rejected by the Lambda's bot check. This wasn't caught at the time because
  verification only checked the backend round-trip (a garbage token, sent directly via curl,
  bypassing the browser/CSP entirely) and the static HTML markup — never an actual browser
  render, since this sandbox's own network policy separately blocks Cloudflare's domain too,
  masking the CSP bug behind an unrelated, expected failure. Added `challenges.cloudflare.com`
  to `script-src`, `connect-src`, and a new `frame-src` directive (Turnstile renders its
  challenge in an iframe). Confirmed the fix with a real Playwright browser: no CSP violation
  is logged anymore for that domain (the request now correctly reaches the network layer,
  where it still fails *here* only because of this sandbox's separate, expected restriction).

### Added

- Frontend error tracking via Sentry (`@sentry/nextjs`) — client, server, and edge runtime
  config, plus `src/app/global-error.tsx` to catch errors in the root layout itself. Inactive
  until `NEXT_PUBLIC_SENTRY_DSN`/`SENTRY_DSN` are set (same graceful-no-op pattern as
  Turnstile/the interest-form endpoint); added the ingest endpoint to the CSP's `connect-src`
  ahead of time (as a wildcard across common regions, to be tightened once a real DSN exists).

## [2026-07-13] (9)

### Added

- `.nvmrc` + `package.json` `engines` field (`>=20 <21`) — nothing previously enforced that
  local dev, CI, and Amplify's build all use the same Node version; they happened to agree
  (20.x, matching the Lambda runtime) but nothing guaranteed it stayed that way.
- `NonprofitOrganization` JSON-LD structured data in the root layout — helps search engines
  understand and potentially enrich how the site appears in results. Only includes fields
  backed by real content already on the site (name, url, description, `hello@seads.sg`,
  Singapore as country) — no fabricated address or social links, since none exist yet.

## [2026-07-13] (8)

### Fixed

- Reconnected the Amplify–GitHub integration via the console's OAuth flow (installing the
  "AWS Amplify" GitHub App), closing the gap noted in the 2026-07-13 (4) entry — PR previews
  now auto-comment their preview URL directly on the PR instead of requiring a manual check
  in the Amplify console. Verified with a real test PR (#3): the bot commented the preview
  link, an "AWS Amplify Console Web Preview" check passed, and the preview environment was
  torn down automatically on close.
- Removed a stale webhook left over from the deleted `us-east-1` Amplify app — wasn't cleaned
  up automatically when that app was deleted during the region migration.

## [2026-07-13] (7)

### Added

- OpenGraph/Twitter card metadata — the site previously had no `og:`/`twitter:` tags at all,
  so sharing a link on social media (a real growth channel for a youth NPO) showed a bare
  fallback with no preview. Added a dynamically-generated branded share image
  (`src/app/opengraph-image.tsx`, via `next/og`'s `ImageResponse` — no external image asset
  needed, matches the site's actual brand palette) plus `openGraph`/`twitter` metadata in the
  root layout, and `metadataBase` (previously unset, which would have resolved the image to
  a broken/localhost URL in production).

### Fixed

- `sitemap.ts`/`robots.ts` fell back to the old, retired `seadssg.vercel.app` URL if
  `NEXT_PUBLIC_SITE_URL` was ever unset — updated to the current Amplify URL.

## [2026-07-13] (6)

### Added

- Custom branded 404 page (`src/app/not-found.tsx`) — previously unmatched routes fell
  through to Next.js's bare default page with no nav, footer, or branding.

### Removed

- Five unused default `create-next-app` scaffold SVGs from `public/` (`file.svg`,
  `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — never referenced anywhere in the
  codebase.

### Checked, no action needed

- Bundle size: ~836KB raw JS total across all chunks, no single route unusually heavy;
  dependencies are just Next/React/Vercel Analytics, nothing bloated.
- All `<Image>` usages already have `alt` text; no raw `<img>` tags anywhere.

## [2026-07-13] (5)

### Added

- Cloudflare Turnstile on the "Get Involved" form — bot check, verified server-side in the
  Lambda before anything is written to DynamoDB. Secret key stored in Secrets Manager
  (`seads/turnstile-secret-key`, matching the convention prepped earlier); site key is public
  and lives in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Verified end-to-end from this session: a
  garbage token round-tripped to Cloudflare's `siteverify` from the Lambda and was correctly
  rejected with a 400. Widget/script only render when the site key is configured, and the
  Lambda fails open (skips the check) if the secret can't be loaded, so neither side can
  brick the form on a config gap — only an actual failed verification is rejected.
- Keyboard accessibility on the nav's flower-bloom dropdowns (`site-header.tsx`) — they were
  mouse-hover-only, so keyboard/screen-reader users could never reach a group's non-default
  children (e.g. "Partners" under "Get Involved"). Now opens on focus, closes on blur-outside,
  and Escape closes it and returns focus to the group link.
- Accessible labels (`required`, `aria-label`) on the interest form's inputs — previously
  relied on placeholder text alone, which isn't a reliable accessible name and disappears
  once the user starts typing. Submission status messages are now in an `aria-live="polite"`
  region so screen readers announce success/error after submit.

## [2026-07-13] (4)

### Added

- Enabled Amplify PR previews on `main` — opening a PR builds a temporary preview
  deployment instead of every change going straight to production. No preview-URL PR
  comment though, since the repo is connected via a PAT rather than the AWS Amplify GitHub
  App (see `docs/DEPLOYMENT.md`).

## [2026-07-13] (3)

### Added

- CloudWatch alarms on the interest-form Lambda's `Errors` and `Throttles` metrics
  (`seads-interest-form-lambda-errors`, `-throttles`), notifying an SNS topic
  (`seads-alerts`, `ap-southeast-1`) that emails `opsfin.sg@aseanyouthadvocates.org`.
- Uptime monitoring via two Route 53 health checks — `seads-api-health-check` against a new
  `GET /health` route (added to both the Lambda and API Gateway; returns `{"ok":true}` with
  no DB/SES calls) and `seads-frontend-health-check` against the Amplify site's `/` — each
  with a CloudWatch alarm. Route 53 health-check metrics only publish to CloudWatch in
  `us-east-1`, so those two alarms and a second `seads-alerts` SNS topic live there,
  separate from the Lambda alarms' `ap-southeast-1` topic.

### Investigated, not implemented

- AWS WAF for the interest-form API Gateway: not possible without extra infrastructure —
  WAF doesn't support API Gateway *HTTP APIs* (only REST APIs, ALBs, CloudFront, etc.), and
  fronting this with a CloudFront distribution just to attach WAF wasn't judged worth it for
  a single contact-form endpoint. Relying instead on the existing account-wide throttle plus
  Cloudflare Turnstile (planned) on the frontend form.

## [2026-07-13] (2)

### Added

- Tagged every Seads AWS resource (`Project=SeadsSingapore`, `Environment=Production`) and
  activated both as cost allocation tags, since this AWS account also hosts unrelated
  projects and spend wasn't previously separable. Added `seads-singapore-project-budget`
  ($30/month, filtered to just `Project=SeadsSingapore`) alongside the existing
  account-wide `seads-monthly-budget`, so there's now an accurate per-project spend view in
  addition to the account-wide safety net. (Most AWS resource names are immutable once
  created, so tags — not a rename — are the actual mechanism for project-level cost
  tracking; true billing separation would mean separate AWS accounts under an
  Organization.)

### Fixed

- Media masonry gallery was centering itself within its container instead of left-aligning,
  most visible after filtering to a category with few items. Left-aligned to match the rest
  of the site's layout.

### Fixed (2)

- The scoped IAM policy on `seads-singapore` was missing `iam:DeleteRole` /
  `DeleteRolePolicy` / `TagRole`, which blocked both known gaps below. Policy updated (by
  the account owner, since the identity that needs more IAM permissions can't grant them to
  itself); orphaned `seads-interest-form-lambda-role` deleted, and both live IAM roles
  (`seads-interest-form-lambda-role-sg`, `seads-gha-lambda-deploy`) tagged
  `Project=SeadsSingapore` + `Environment=Production` to match every other Seads resource.

## [2026-07-13]

### Added

- CI/CD for the interest-form Lambda: `.github/workflows/deploy-interest-form-lambda.yml`
  deploys on every push to `main` touching `backend/interest-form/**`, authenticating via a
  GitHub OIDC role (`seads-gha-lambda-deploy`) instead of storing AWS keys as GitHub secrets.
  Trust is scoped to `repo:Jayyy419/SeadsSingapore:ref:refs/heads/main`; permissions are
  scoped to `lambda:UpdateFunctionCode`/`GetFunction`/`GetFunctionConfiguration` on just this
  function (`backend/interest-form/gha-oidc-trust-policy.json` and `gha-deploy-policy.json`).
  The manual deploy steps in `backend/interest-form/README.md` remain as a fallback.
- Added `secretsmanager:GetSecretValue` (scoped to the `seads/*` name prefix) to the Lambda's
  execution role ahead of actually needing a secret, so adding one later needs no IAM change.

- CI workflow (`.github/workflows/ci.yml`): lint, typecheck, and build run on every PR and
  push to `main`, so a broken build is caught before Amplify tries to deploy it in production.

### Confirmed

- SES production access is approved — the interest-form notification email is no longer
  sandbox-limited (was 200/day, verified recipients only).

### Changed

- Moved the backend (Lambda, API Gateway, DynamoDB) and Amplify Hosting from `us-east-1` to
  `ap-southeast-1` (Singapore) — this project's audience is Singapore/SEA-based, and the
  interactive form backend (unlike Amplify's already-globally-edge-cached static assets)
  benefits directly from sitting in-region instead of round-tripping to Virginia. SES was
  re-verified and re-approved for production access in the new region too (see
  `docs/LEARNING_GUIDE.md` Part 7 for the full writeup, including what does and doesn't
  actually benefit from a region move). New Amplify app: `d2mrph1bcp6pjx`
  (`https://main.d2mrph1bcp6pjx.amplifyapp.com`). New API Gateway: `jztkgrm3lh`. Old
  `us-east-1` stack (Amplify app `d1s8x62kxpmlx7`, Lambda, API Gateway `h0bq61l33m`, DynamoDB
  table, SES identity, CloudWatch log group) deleted after the new region was verified working
  end-to-end.
- Restored the Media gallery's animated masonry layout — JS-computed absolute-positioned
  columns with a bounce-in entrance animation and smooth reflow when switching filter
  category, matching the original Claude Design prototype (`Media.dc.html`). This had been
  simplified to a plain CSS-columns layout when the site was first ported to Next.js and never
  fully restored. Used on both the dedicated `/media` page and the homepage gallery teaser.
- Clicking a nav group label ("Get Involved", "Newsroom") now goes to that group's first child
  alphabetically (Events, Media) instead of an arbitrary page. "Who We Are" already pointed to
  About, which was already first alphabetically.

### Known Gaps

- ~~Orphaned IAM role `seads-interest-form-lambda-role`~~ — resolved, see the 2026-07-13 (2)
  entry above.

## [2026-07-12]

### Added (backend hardening)

- Set `NOTIFY_EMAIL` on the interest-form Lambda and verified it in SES (confirmed via a
  real end-to-end test: submission landed in DynamoDB, no SES error in the logs).
- Submitted SES production-access request (currently sandboxed).
- CloudWatch log retention set to 90 days on the Lambda's log group (was unset/indefinite).
- DynamoDB point-in-time recovery enabled on `seads-interest-submissions`.
- API Gateway throttling (5 req/s, burst 10) on the interest-form endpoint.
- $30/month AWS Budget with 80%/100% actual and 100% forecasted spend alerts.

### Added

- Migrated hosting from Vercel to **AWS Amplify Hosting** (app `SeadsSingapore`,
  `d1s8x62kxpmlx7`, `us-east-1`), connected to `main` on GitHub with auto-deploy on push.
  Vercel is left running untouched as a fallback until a custom domain is confirmed working
  on Amplify.
- Built a real backend for the "Get Involved" form: API Gateway -> Lambda -> DynamoDB, with
  a best-effort SES notification email. This replaces the Google Sheets integration, which
  was never actually configured in production (see the 2026-07-11 entry — the form was
  silently discarding every submission). Source now lives in `backend/interest-form/`.
- Renamed `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT` to `NEXT_PUBLIC_INTEREST_FORM_ENDPOINT` to
  match (it was never Google Sheets in practice).

### Known Gaps

- SES is still in sandbox mode — request production access before relying on the
  notification email for real traffic.
- No custom domain yet; Amplify is serving from its default `*.amplifyapp.com` URL.
- No CI for the Lambda — deploys are manual (`backend/interest-form/README.md`).

## [2026-07-11]

### Fixed

- Mobile navigation permanently rendered the desktop layout (crammed nav overflowing
  horizontally, hamburger hidden) on every route for every mobile visitor. Root cause: a
  `useState` lazy initializer read `window.innerWidth`, which is unavailable during the
  static prerender, so the server always baked in the desktop layout — and React's
  hydration commit doesn't repaint markup it thinks already matches, so nothing ever
  corrected it afterward. Fixed by initializing at the SSR-safe default and correcting via
  `useLayoutEffect` post-mount (a genuine post-hydration render, which React does apply).
- The homepage "Get Involved" form silently told every visitor their submission was
  captured even when `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT` was unset (which it currently
  is) — nothing was actually being saved anywhere. Now shows an honest "not connected yet,
  email us directly" message instead.
- `events/page.tsx`: the "Join Our Events" button had no `onClick` handler at all.
- `contact/page.tsx`: the three email addresses were plain text, not clickable.

### Added

- Hover states across the site: cards, CTA buttons, nav/footer links, the locale switcher,
  theme toggle, and MediaMasonry's filter pills/gallery images/lightbox — previously there
  was no `hover:` styling anywhere despite `--brand-deep` being defined specifically for
  this purpose.
- Site-wide smooth scroll (respecting `prefers-reduced-motion`) and a consistent
  `:focus-visible` ring for keyboard navigation.
- `.env.example`, documenting the one environment variable this project actually uses
  (`docs/ENVIRONMENT.md` referenced a `.env.example` that didn't exist).

### Removed

- The Sanity CMS integration (`next-sanity`, `@sanity/client`, `groq`,
  `src/lib/sanity.ts`, `src/lib/queries.ts`). It was scaffolded early on but never
  actually imported by any route, and its dependency tree (a full copy of the Sanity
  Studio/CLI toolchain, including a bundled Vite dev server) accounted for 18 of this
  project's 23 `npm audit` findings. Removing it dropped that to 5, and a follow-up
  `npm audit fix` brought it to 3 — all three are inside Next.js's own bundled build-time
  PostCSS, not fixable without downgrading Next.js itself, and not exploitable here since
  no user input flows through it (see `docs/ARCHITECTURE.md`).

## [2026-07-10]

### Changed

- Rebranded the site from Spark SG to Seads: dictionary-entry homepage hero, vine/flower-bloom
  nav header, light/dark theme toggle, and an EN/MN/BM/HI locale switcher with hover tooltips,
  ported from a Claude Design prototype
- Added dark-theme CSS tokens and dedicated `--inverse-bg`/`--inverse-fg` tokens for
  always-dark sections/CTAs
- Rebranded all remaining routes (about, programs, events, team, contact, partners, donate,
  media, blog, join), `siteContent.ts`, the shared footer, and page metadata
- Removed the Spark-era cinematic motion system (`cursor-smoke.tsx`, `motion-choreography.tsx`,
  `magnetic-effects.tsx` and their `hero-glow`/`cinematic-layer`/`magnetic`/`[data-reveal]`
  CSS) — kept only the scroll-progress bar

## [2026-06-02]

### Added

- Added documentation set under `docs/`:
  - `README.md`
  - `ARCHITECTURE.md`
  - `TECH_STACK.md`
  - `ENVIRONMENT.md`
  - `ROUTES.md`
  - `DEPLOYMENT.md`
  - `CHANGELOG.md`
- Added visual reference board:
  - `design-reference.html`

### Changed

- Added `vercel.json` with explicit framework setting:
  - `"framework": "nextjs"`
- Stabilized production deployment behavior and alias routing for:
  - `sparksg.vercel.app`

### Fixed

- Resolved Vercel production `NOT_FOUND` issue caused by framework/output misconfiguration at project level
- Re-deployed and remapped alias to a healthy production deployment

## [2026-05-15]

### Added

- Initial Next.js project scaffold and base route structure
- Core site pages for SparkSG content sections
- Local typed content module and Sanity-ready query/client utilities
