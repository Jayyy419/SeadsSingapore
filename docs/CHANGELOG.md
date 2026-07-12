# Changelog

All notable changes to this project should be documented in this file.

This format is inspired by Keep a Changelog and uses a date-based release style.

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
