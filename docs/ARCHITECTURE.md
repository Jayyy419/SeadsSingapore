# Architecture

## High-Level Overview

Seads is a Next.js App Router web application with:

- A rich homepage experience (`src/app/page.tsx`)
- Supporting informational routes (about, programs, events, team, partners, blog, contact, join, donate)
- Reusable shell layout for subpages (`src/components/site-shell.tsx`)
- Local typed content source (`src/content/siteContent.ts`) — no CMS is wired up yet (a
  prior Sanity integration was scaffolded but never used and has been removed; see the
  Changelog)
- A small AWS backend (API Gateway + Lambda + DynamoDB + SES) behind the "Get Involved"
  interest form — see Backend Architecture below

## Runtime Flow

1. Request enters Next.js App Router route in `src/app`.
2. Root layout (`src/app/layout.tsx`) provides global metadata, font setup, global CSS, and analytics.
3. Route-level page component renders:
   - Homepage uses local state and client-side interactions (`"use client"`).
   - Subpages render static sections and shared shell wrappers.
4. Data sources:
   - Only current source: static TypeScript content modules (`src/content/*`). No backend
     API or database is queried at request time.

## Main Directories

- `src/app`
  - Route segments and page components
  - Global layout and global stylesheet
- `src/components`
  - Reusable UI wrappers such as `SiteShell`
- `src/content`
  - Typed local data objects for metrics, programs, events, stories, team, and testimonials
- `src/lib`
  - Shared non-content utilities (currently just `vine.ts`, the nav's vine/bloom geometry)
- `public`
  - Static assets

## Key App Components

### Root Layout

File: `src/app/layout.tsx`

Responsibilities:

- Sets document metadata
- Registers fonts through `next/font/google`
- Imports global styles
- Injects Vercel Analytics

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

### Current Source of Truth

- `src/content/siteContent.ts`
- Strongly typed arrays and records used by route components

### CMS

None yet. All site content (programs, events, team, stories, testimonials, media) is static
TypeScript modules baked into the build at compile time (the site is fully statically
prerendered — see Deployment Architecture below). A prior Sanity CMS integration was
scaffolded (`src/lib/sanity.ts`, `src/lib/queries.ts`) but never actually used by any route,
and pulled in ~800 transitive packages including most of this project's `npm audit` findings,
so it was removed. If/when a real CMS is added, this is the natural place to wire it in — swap
the imports in each route from `@/content/siteContent` to a fetch/query call, without needing
to restructure the routes themselves.

## Backend Architecture

The only live backend is the "Get Involved" interest-form pipeline, on AWS (`us-east-1`,
account `140023398409`):

```
Browser --POST--> API Gateway (HTTP API, seads-interest-form-api)
                      |
                      v
                 Lambda (seads-interest-form-handler, Node.js 20.x)
                      |
                      +--> DynamoDB (seads-interest-submissions) — always
                      +--> SES SendEmail to the configured notify address — best-effort,
                           logged but non-fatal if it fails (submission is already saved)
```

- **API Gateway**: `seads-interest-form-api`, single route `POST /submit-interest`, CORS
  restricted to the deployed frontend origin(s), throttled to 5 req/s (burst 10) on the
  `$default` stage to limit abuse of a public, unauthenticated endpoint. Update the CORS
  allow-list (both here and in the Lambda's `ALLOWED_ORIGINS` env var) when the custom
  domain goes live.
- **Lambda**: `seads-interest-form-handler`, source in `backend/interest-form/`. Validates
  `name`/`email`/`interest`, writes to DynamoDB with a generated UUID + timestamp, then
  attempts an SES notification email to `NOTIFY_EMAIL`. CloudWatch log retention set to 90
  days (default is "never expire," which just accumulates cost indefinitely).
- **DynamoDB**: `seads-interest-submissions`, on-demand billing, partition key `id` (string),
  point-in-time recovery enabled (35-day rolling restore window).
- **SES**: production-access request submitted (AWS reviews these; sandbox limits — verified
  addresses only, 200/day, 1/sec — apply until approved). `NOTIFY_EMAIL` must be a
  SES-verified address; re-verify and update the Lambda env var if it changes.
- **IAM**: the Lambda's execution role (`seads-interest-form-lambda-role`) is scoped to
  exactly `dynamodb:PutItem` on that one table, `ses:SendEmail`, and CloudWatch Logs — not
  broader account access.
- **Billing**: a $30/month AWS Budget (`seads-monthly-budget`) alerts on 80%/100% actual
  spend and 100% forecasted spend.

**Known gap:** no CI for the Lambda yet — deploys are manual (`backend/interest-form/README.md`).
Also no auth/rate-limiting beyond API Gateway's per-IP-agnostic throttle (5 req/s account-wide
for this route, not per-visitor), so a determined abuser could still exhaust it for everyone;
revisit if this ever becomes a real problem (e.g. add a CAPTCHA or WAF rule).

## Styling Architecture

- Global color tokens live in `src/app/globals.css`, with a `:root[data-theme="dark"]` override
  block for dark mode (toggled by `SiteHeader`)
- Utility-first styling via Tailwind classes in components
- Additional custom classes include:
  - `section-card` — the shared card treatment (border, radius, subtle shadow)
  - `stripe-ph` — diagonal-stripe placeholder fill for photo/portrait slots
  - `seads-*` keyframes — the nav's vine/bloom hover animation

## Deployment Architecture

- Target platform: Vercel
- Framework override: `vercel.json` with `"framework": "nextjs"`
- This avoids framework mis-detection issues and ensures proper Next.js output handling
