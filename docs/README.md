# SparkSG Docs

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
- Data is currently sourced from `src/content/siteContent.ts`, with Sanity-ready query/client utilities in `src/lib`.
- Analytics is enabled via Vercel Analytics in `src/app/layout.tsx`.
