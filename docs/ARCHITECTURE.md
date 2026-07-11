# Architecture

## High-Level Overview

Seads is a Next.js App Router web application with:

- A rich homepage experience (`src/app/page.tsx`)
- Supporting informational routes (about, programs, events, team, partners, blog, contact, join, donate)
- Reusable shell layout for subpages (`src/components/site-shell.tsx`)
- Local typed content source (`src/content/siteContent.ts`)
- Google Sheets endpoint submission for the "Get Involved" interest form (no CMS or
  database is wired up yet — a prior Sanity integration was scaffolded but never used and
  has been removed; see the Changelog)

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
- Supports optional form submission to `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT`

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

### Backend / CMS

None yet. All content is static TypeScript modules baked into the build at compile time
(the site is fully statically prerendered — see Deployment Architecture below). A prior
Sanity CMS integration was scaffolded (`src/lib/sanity.ts`, `src/lib/queries.ts`) but never
actually used by any route, and pulled in ~800 transitive packages including most of this
project's npm audit findings, so it was removed. If/when a real backend is added (a database,
CMS, or custom API), this is the natural place to wire it in — swap the imports in each route
from `@/content/siteContent` to a fetch/query call, without needing to restructure the routes
themselves.

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
