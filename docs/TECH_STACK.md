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
  - Space Grotesk
  - Playfair Display

## Content and Data

- Local typed content source:
  - `src/content/siteContent.ts`
- Sanity-ready integration:
  - `next-sanity`
  - `@sanity/client`
  - `groq`
  - Query definitions in `src/lib/queries.ts`
  - Sanity client config in `src/lib/sanity.ts`

## Analytics and Hosting

- Vercel Analytics (`@vercel/analytics`)
- Vercel hosting (production alias currently includes `sparksg.vercel.app`)
- Project-level Vercel framework override in `vercel.json`

## Quality and Tooling

- ESLint 9 + `eslint-config-next`
- Next.js TypeScript plugin via `tsconfig.json`

## Build and Config Files

- `package.json`: scripts and dependencies
- `tsconfig.json`: strict TypeScript + alias `@/* -> src/*`
- `next.config.ts`: default Next.js config scaffold
- `vercel.json`: framework set to Next.js
