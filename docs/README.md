# Seads Docs

This folder contains project documentation for development, deployment, and maintenance.

## Index

- [Architecture](./ARCHITECTURE.md)
- [Tech Stack](./TECH_STACK.md)
- [Environment Variables](./ENVIRONMENT.md)
- [Routes and Pages](./ROUTES.md)
- [Deployment Runbook](./DEPLOYMENT.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Changelog](./CHANGELOG.md)

## Quick Start

1. Install dependencies:
   - `npm install`
2. Run development server:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`

## Scripts

From `package.json`:

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Notes

- This project uses Next.js App Router in `src/app`.
- Most content (team, partners, programs, stories, events, impact metrics) is DynamoDB-backed
  and managed through a self-built admin panel at `/admin`; testimonials and UI copy remain
  local TypeScript modules (`src/content/*`) — see `docs/ARCHITECTURE.md`.
- Error tracking is via Sentry (`@sentry/nextjs`), inactive until `SENTRY_DSN` is set — see
  `docs/ENVIRONMENT.md`.
