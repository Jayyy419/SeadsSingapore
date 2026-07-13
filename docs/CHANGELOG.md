# Changelog

All notable changes to this project should be documented in this file.

This format is inspired by Keep a Changelog and uses a date-based release style.

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

