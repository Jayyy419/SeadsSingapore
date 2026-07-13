# Tech Stack

## Core Runtime

- Next.js 16.2.6
- React 19.2.4
- React DOM 19.2.4
- TypeScript 5

## Styling and UI

- Tailwind CSS v4 (via `@import "tailwindcss"` in `src/app/globals.css`)
- Custom CSS variables and utility classes in `src/app/globals.css`
- Google Fonts loaded through `next/font/google`:
  - Manrope (sans, body)
  - Source Serif 4 (display/headings, `.font-display`)

## Content and Data

- Local typed content source:
  - `src/content/siteContent.ts` (programs, events, stories, team, testimonials, impact metrics)
  - `src/content/media.ts` (gallery items)
  - `src/content/i18n.ts` (EN/MN/BM/HI translations)
- No CMS — a Sanity integration was scaffolded early on but never actually used by any
  route, and was removed (it pulled in ~800 transitive packages and accounted for nearly
  all of this project's `npm audit` findings).

## Backend (AWS)

- API Gateway (HTTP API) + Lambda (Node.js 20.x) + DynamoDB + SES behind the "Get Involved"
  form — see `docs/ARCHITECTURE.md` (Backend Architecture) and `backend/interest-form/`
- No auth, database beyond DynamoDB, or CMS yet — see Architecture doc's "Not doing yet" list

## Analytics, Monitoring, and Hosting

- Vercel Analytics (`@vercel/analytics`) — kept even after moving hosting off Vercel; it's
  just a client-side script, doesn't require Vercel hosting
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
