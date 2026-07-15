# Architecture

## High-Level Overview

Seads is a Next.js App Router web application with:

- A rich homepage experience (`src/app/page.tsx`)
- Supporting informational routes (about, programs, events, team, partners, blog, contact,
  join, donate, media, privacy) plus dynamic detail routes (`/programs/[slug]`,
  `/events/[slug]`, `/blog/[slug]`)
- Reusable shell layout for subpages (`src/components/site-shell.tsx`)
- A self-built admin panel (`/admin/*`) backed by DynamoDB, letting a non-technical admin
  create/edit/delete/reorder every piece of dynamic content without a code change or
  redeploy — see "Admin Panel" below. This replaced the originally-planned "static content,
  redeploy to change anything" model; a prior Sanity CMS integration was scaffolded even
  earlier but never used and was removed (see the Changelog).
- A small piece of content (testimonials, static i18n copy) still lives in
  `src/content/siteContent.ts`/`src/content/i18n.ts` as local typed data — everything else
  (team, partners, programs, stories, events, impact metrics) is DynamoDB-backed
- An AWS backend (API Gateway + Lambda + 10 DynamoDB tables + S3 + SES) — see
  Backend Architecture below

## Runtime Flow

1. Request enters Next.js App Router route in `src/app`.
2. Root layout (`src/app/layout.tsx`) provides global metadata, font setup, global CSS, and analytics.
3. Route-level page component renders:
   - Homepage uses local state and client-side interactions (`"use client"`).
   - Subpages render static sections and shared shell wrappers.
4. Data sources:
   - Most content (team, partners, programs, stories, events, impact metrics) is fetched at
     request time from the Lambda's public GET endpoints, which read DynamoDB. List pages use
     a "static-fallback then live-swap" pattern (`src/lib/use-team.ts` and siblings): render
     immediately from bundled static seed data, then replace it once the live fetch resolves,
     so the page never shows a loading spinner or goes blank if the API is briefly slow.
   - `[slug]` detail pages (events/programs/blog) additionally fetch server-side in
     `generateMetadata` for correct per-page `<title>`/OG tags and JSON-LD, wrapped in
     try/catch so a network failure falls back to generic metadata instead of a 500.
   - Testimonials and static UI copy remain local TypeScript modules
     (`src/content/*`) with no backend involved.

## Main Directories

- `src/app`
  - Route segments and page components
  - Global layout and global stylesheet
- `src/components`
  - Reusable UI wrappers such as `SiteShell`
- `src/content`
  - Typed local data objects for metrics, programs, events, stories, team, and testimonials
- `src/lib`
  - Shared non-content utilities: `vine.ts` (nav's vine/bloom geometry), `locale-context.tsx`
    (i18n provider/hook), `use-team.ts`/`use-partners.ts`/`use-programs.ts`/`use-events.ts`/
    `use-stories.ts`/`use-event-rsvp-counts.ts` (static-fallback-then-live-swap data hooks),
    `internal-api.ts` (server-side helper for calling the Lambda's `/internal/*` routes with
    the admin session header), `json-ld.ts` (XSS-safe JSON-LD serialization), `ics.ts`
    (calendar file generation), `event-capacity.ts`, `whatsapp.ts`
- `public`
  - Static assets

## Key App Components

### Root Layout

File: `src/app/layout.tsx`

Responsibilities:

- Sets document metadata
- Registers fonts through `next/font/google`
- Imports global styles
- Wires up Sentry error tracking (`instrumentation.ts`, no-ops if `SENTRY_DSN` is unset)

### Homepage

File: `src/app/page.tsx`

Responsibilities:

- Renders the dictionary-entry hero (Seads /si:dz/), impact, about/etymology, programs, events,
  stories + gallery, team, testimonials, and get-involved sections
- Receives locale changes from `SiteHeader` (`en`, `zh`, `ms`, `hi`) via an `onLocaleChange` callback
  and translates its own body copy from `src/content/i18n.ts`
- Submits the "Get Involved" form to `NEXT_PUBLIC_INTEREST_FORM_ENDPOINT` — see Backend
  Architecture

### Site Header

File: `src/components/site-header.tsx`

Responsibilities:

- Shared sticky nav across every route (rendered directly by `page.tsx` and by `SiteShell`)
- Owns locale state (persisted to `localStorage`, four languages) and light/dark theme state
  (persisted to `localStorage`, toggles `data-theme` on `<html>`)
- Renders the vine SVG + grouped nav that blooms into a flower of sub-links on hover
  (geometry in `src/lib/vine.ts`)
- Auto-detects the active nav group/child from the current route via `usePathname()`

### Site Shell

File: `src/components/site-shell.tsx`

Responsibilities:

- Shared navigation and footer for non-home routes
- Optional page title and subtitle hero block
- Reusable structure for consistent route styling

## Data Architecture

### Source of Truth

- **DynamoDB** (via the Lambda's API) for everything admin-editable: team, partners,
  programs, stories, events, impact metrics, story submissions (moderation queue), interest-
  form submissions, admin config (password hash), and the audit log — 10 tables total.
- **`src/content/siteContent.ts`** for testimonials and any not-yet-migrated static seed data
  (also doubles as the offline/loading-state fallback for the DynamoDB-backed content above).
- **`src/content/i18n.ts`** for all UI chrome copy across 4 locales (en/zh/ms/hi).

### CMS

Not a third-party CMS — a self-built one. The `/admin/*` panel (single shared password,
session cookie, see "Admin Panel" below) is the actual content-management surface: every
admin list page (Team/Partners/Programs/Blog/Events/Impact metrics) supports create, edit,
delete, and manual reordering, backed directly by the Lambda's `/internal/*` routes. A prior
Sanity CMS integration was scaffolded early on (`src/lib/sanity.ts`, `src/lib/queries.ts`) but
never actually used by any route, and pulled in ~800 transitive packages including most of
this project's `npm audit` findings at the time, so it was removed in favor of this
purpose-built alternative.

## Admin Panel

`/admin/*`, gated by `src/proxy.ts` (redirects to `/admin/login` without a valid session
cookie). Single shared admin password (no per-user accounts) — see
`backend/interest-form/README.md`'s "Environment variables" for `ADMIN_PASSWORD`/
`ADMIN_SESSION_SECRET` and how the password is stored/rotated.

- **Content CRUD**: `/admin/team`, `/admin/partners`, `/admin/programs`, `/admin/blog`,
  `/admin/events`, `/admin/impact-metrics` — each a Server Component list page + Server
  Action `actions.ts` calling the Lambda's `/internal/*` routes with the `x-admin-token`
  session header. Photos/logos upload via a presigned S3 PUT (`admin-image-upload.tsx`) —
  the browser uploads directly to `seads-media`, never through the Lambda/API Gateway.
- **Moderation**: `/admin/submissions` (interest-form + event RSVP entries, read/delete only)
  and `/admin/stories` (community story submissions — approve/reject, approved ones surface
  publicly on `/blog`).
- **Audit log**: `/admin/audit-log` — every create/update/delete through `/admin/*` is
  recorded (action, entity type, slug, which fields actually changed on an update, a
  best-effort source IP, timestamp) in `seads-admin-audit-log`. There's no per-admin identity
  to attribute actions to (single shared password), so this is a "what changed and roughly
  when," not a "who did it," record.
- **Settings**: `/admin/settings` — change the admin password in-app.

## Backend Architecture

The whole backend — public interest-form/RSVP submissions *and* the entire admin panel's
CRUD API — is one Lambda behind one API Gateway, on AWS (`ap-southeast-1`, account
`140023398409` — moved from `us-east-1` on 2026-07-13 since this project's audience is
Singapore/SEA-based and this is the only part of the stack that isn't already edge-cached by
CloudFront):

```
Browser --POST/GET--> API Gateway (HTTP API, seads-interest-form-api)
                            |
                            v
                       Lambda (seads-interest-form-handler, Node.js 20.x)
                       a flat if-chain router in index.mjs, ~1200 lines
                            |
      +---------------------------+----------------------------+
      |                           |                            |
      v                           v                            v
 DynamoDB (10 tables,       S3 (seads-media,             SES SendEmail
 see below) — every         presigned uploads only,      (submission/RSVP
 read and write goes        never proxied through         notifications) —
 through this Lambda,       the Lambda) + SNS/SES          best-effort, never
 no direct client access    for the notify email           fails the request
```

- **API Gateway**: `seads-interest-form-api`, routes split into public (unauthenticated, e.g.
  `POST /submit-interest`, `GET /events`, `GET /programs`) and `/internal/*` (require a valid
  `x-admin-token` session header, checked inside the Lambda — not via a separate authorizer).
  CORS is restricted to the deployed frontend origin(s) (both here and in the Lambda's
  `ALLOWED_ORIGINS` env var), and the public write endpoints are throttled + per-IP/per-email
  rate-limited (see `checkRateLimit` in `index.mjs`) to limit abuse. `GET /health` is
  unauthenticated with no DB/SES calls, used only by the Route 53 health check below.
- **Lambda**: `seads-interest-form-handler`, source in `backend/interest-form/index.mjs`.
  One handler function per route (`handleSubmitInterest`, `handleCreateEvent`,
  `handleGetEvents`, `handleUpdateTeamMember`, …), dispatched by a chain of `if` checks against
  the request path/method at the bottom of the file — there's no framework/router library.
  CloudWatch log retention set to 90 days (default is "never expire," which just accumulates
  cost indefinitely).
- **DynamoDB**: 10 on-demand-billing tables, all with point-in-time recovery enabled
  (35-day rolling restore window) — `seads-interest-submissions`, `seads-impact-metrics`,
  `seads-story-submissions`, `seads-admin-config`, `seads-events`, `seads-admin-audit-log`,
  `seads-team`, `seads-partners`, `seads-programs`, `seads-stories`. Every table's partition
  key is either a generated `id`/UUID or a `slugify()`-derived `slug` string; create handlers
  for slug-keyed entities use a conditional `PutCommand` (`ConditionExpression:
  attribute_not_exists(slug)`) so two concurrent creates that derive the same slug can't
  silently overwrite one another — one gets a clean `409` instead.
- **S3**: `seads-media` (`ap-southeast-1`) stores admin-uploaded photos/logos. The admin's
  browser uploads directly to S3 via a Lambda-issued presigned PUT URL — file bytes never
  pass through the Lambda/API Gateway, which have their own request-size limits far below
  what a photo needs. See `backend/interest-form/README.md`'s "The media bucket" for the
  bucket policy/CORS/public-access-block configuration (committed as IaC alongside the code).
- **SES**: production access approved 2026-07-13 — no more sandbox limits (verified
  recipients only, 200/day). `NOTIFY_EMAIL` must still be a SES-verified *sender* address;
  re-verify and update the Lambda env var if it changes.
- **IAM**: the Lambda's execution role (`seads-interest-form-lambda-role-sg`) is scoped to
  read/write on exactly the 10 tables above, presigned-URL generation + object delete on
  `seads-media` only, `ses:SendEmail`, CloudWatch Logs, and reads under the `seads/*` Secrets
  Manager prefix — not broader account access. Policy tracked as
  `backend/interest-form/iam-policy.json`; see that README for how to update it.
- **CI/CD**: `.github/workflows/deploy-interest-form-lambda.yml` deploys the Lambda on every
  push to `main` that touches `backend/interest-form/**`, authenticating to AWS via GitHub's
  OIDC provider (role `seads-gha-lambda-deploy`, trust scoped to this repo+branch, permissions
  scoped to `lambda:UpdateFunctionCode` on this one function) — no long-lived AWS keys stored
  in GitHub.
- **Billing**: this AWS account is shared with other, unrelated projects, so there are two
  budgets — `seads-monthly-budget` ($30/month, tracks the *entire account*, a catch-all
  safety net) and `seads-singapore-project-budget` ($30/month, scoped via a `CostFilters`
  tag filter to only `Project=SeadsSingapore`-tagged resources, for accurate per-project
  spend). Both alert the same address on 80%/100% actual and 100% forecasted spend. Every
  Seads resource (Lambda, DynamoDB, API Gateway, Amplify app, CloudWatch log group, SES
  identity) is tagged `Project=SeadsSingapore` + `Environment=Production`, and `Project`/
  `Environment` are activated as cost allocation tags so Cost Explorer can filter/group by
  them too (tag-based cost data typically takes up to 24h after activation to start
  populating). Note: AWS doesn't support literally splitting *payment* by project within one
  account — the invoice is still one consolidated charge — this gets you accurate
  per-project cost *visibility and alerting*, which is what a budget filter is actually
  for. True billing separation would mean separate AWS accounts under an AWS Organization,
  overkill for a single project like this.

- **Monitoring**: two CloudWatch alarms on the Lambda itself (`seads-interest-form-lambda-errors`,
  `seads-interest-form-lambda-throttles`, both in `ap-southeast-1`), and two Route 53 health
  checks with matching alarms (`seads-api-health-check` against `GET /health`,
  `seads-frontend-health-check` against the Amplify site's `/`) — Route 53 health-check
  metrics only publish to CloudWatch in `us-east-1` regardless of where the checked endpoint
  lives, so those two alarms (and their SNS topic) are in `us-east-1`, separate from the
  Lambda alarms' `ap-southeast-1` SNS topic. Both topics are named `seads-alerts` and email
  the same address — same name, different region, easy to mix up.
- **WAF**: not used. AWS WAF doesn't support API Gateway *HTTP APIs* (only REST APIs, ALBs,
  CloudFront, etc.) — fronting this with CloudFront just to attach WAF was judged not worth
  the added infrastructure for a single contact-form endpoint. Abuse mitigation instead: the
  account-wide throttle above, plus Cloudflare Turnstile (below) on the frontend form.
- **Turnstile**: bot check on the "Get Involved" form, verified server-side (the Lambda calls
  Cloudflare's `siteverify` before touching DynamoDB — the frontend token alone proves
  nothing on its own). Secret key in Secrets Manager (`seads/turnstile-secret-key`); site key
  is public (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`). Both sides degrade gracefully if unconfigured
  (widget doesn't render / Lambda skips the check) rather than hard-failing the form.

Public write endpoints also have per-IP and per-email rate limiting (`checkRateLimit` in
`index.mjs`, backed by a DynamoDB counter with TTL) on top of the account-wide API Gateway
throttle above, so a single abusive client gets a `429` well before exhausting the shared
budget for everyone else.

## Styling Architecture

- Global color tokens live in `src/app/globals.css`, with a `:root[data-theme="dark"]` override
  block for dark mode (toggled by `SiteHeader`)
- Utility-first styling via Tailwind classes in components
- Additional custom classes include:
  - `section-card` — the shared card treatment (border, radius, subtle shadow)
  - `stripe-ph` — diagonal-stripe placeholder fill for photo/portrait slots
  - `seads-*` keyframes — the nav's vine/bloom hover animation

## Deployment Architecture

- Target platform: **AWS Amplify Hosting** (`ap-southeast-1`) — see `docs/DEPLOYMENT.md` for
  the full runbook (app ID, PR previews, rollback, custom domain notes)
- Backend (`backend/interest-form/`) deploys separately via
  `.github/workflows/deploy-interest-form-lambda.yml` on every push to `main` touching that
  path, gated by a `node --check` syntax step before `lambda:UpdateFunctionCode`
- `vercel.json` (`"framework": "nextjs"`) is legacy, from when Vercel was the deploy target —
  see `docs/DEPLOYMENT.md`'s "Legacy" note
