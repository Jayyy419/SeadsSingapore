# Tech Stack

## Core Runtime

- Next.js 16.2.10
- React 19.2.7
- React DOM 19.2.7
- TypeScript 5

## Styling and UI

- Tailwind CSS v4 (via `@import "tailwindcss"` in `src/app/globals.css`)
- Custom CSS variables and utility classes in `src/app/globals.css`
- Google Fonts loaded through `next/font/google`:
  - Manrope (sans, body)
  - Source Serif 4 (display/headings, `.font-display`)

## Content and Data

- Local typed content source (testimonials + static seed/fallback data, plus all UI copy):
  - `src/content/siteContent.ts` (programs, events, stories, team, testimonials, impact metrics)
  - `src/content/media.ts` (gallery items)
  - `src/content/i18n.ts` (EN/ZH/MS/HI translations)
- Everything admin-editable (team, partners, programs, stories, events, impact metrics,
  submissions, story-submission moderation queue) is DynamoDB-backed, managed through a
  self-built admin panel (`/admin/*`) — see `docs/ARCHITECTURE.md`'s "Admin Panel" section.
  No third-party CMS is used; a Sanity integration was scaffolded early on but never actually
  used by any route, and was removed (it pulled in ~800 transitive packages and accounted for
  nearly all of this project's `npm audit` findings at the time).

## Backend (AWS)

- API Gateway (HTTP API) + Lambda (Node.js 20.x) + 10 DynamoDB tables + S3 + SES — see
  `docs/ARCHITECTURE.md` (Backend Architecture) and `backend/interest-form/`
- **Auth**: single shared admin password (no per-user accounts), hashed (scrypt) and stored
  in DynamoDB, session cookie signed with an HMAC secret — see `backend/interest-form/README.md`

## Analytics, Monitoring, and Hosting

- Sentry (`@sentry/nextjs`) — client/server/edge error tracking, wired up but inactive until
  `NEXT_PUBLIC_SENTRY_DSN`/`SENTRY_DSN` are set (`.env.example`, Amplify env vars); no-ops
  entirely if unset. Config: `sentry.client.config.ts`, `sentry.server.config.ts`,
  `sentry.edge.config.ts`, `instrumentation.ts`, `src/app/global-error.tsx`.
- **AWS Amplify Hosting** (`ap-southeast-1`) — see `docs/DEPLOYMENT.md`
- Legacy: Vercel hosting (`sparksg.vercel.app` / `seadssg.vercel.app`) — being phased out,
  see `docs/DEPLOYMENT.md`

## Quality and Tooling

- ESLint 9 + `eslint-config-next`
- Next.js TypeScript plugin via `tsconfig.json`

## Build and Config Files

- `package.json`: scripts and dependencies
- `tsconfig.json`: strict TypeScript + alias `@/* -> src/*`
- `next.config.ts`: security headers (see `docs/ARCHITECTURE.md`)
- `vercel.json`: legacy, framework set to Next.js — no longer the deploy target
