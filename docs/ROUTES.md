# Routes and Pages

## App Router Pages

Defined under `src/app`:

- `/` -> `src/app/page.tsx`
- `/about` -> `src/app/about/page.tsx`
- `/blog` -> `src/app/blog/page.tsx`
- `/contact` -> `src/app/contact/page.tsx`
- `/donate` -> `src/app/donate/page.tsx`
- `/events` -> `src/app/events/page.tsx`
- `/join` -> `src/app/join/page.tsx`
- `/media` -> `src/app/media/page.tsx`
- `/partners` -> `src/app/partners/page.tsx`
- `/programs` -> `src/app/programs/page.tsx`
- `/team` -> `src/app/team/page.tsx`

## Shared Route Wrapper

Most non-home routes use:

- `src/components/site-shell.tsx`

This provides:

- Sticky header with navigation
- Optional route title/subtitle hero
- Shared footer

## Route Content Strategy

- Static route pages currently render local content and copy
- Blog list currently maps local `stories` from `src/content/siteContent.ts`
- Homepage also uses local content plus interactive filtering and form actions

## SEO

- Every subpage exports its own `metadata` (title/description); the homepage inherits the
  root layout's default since it's a client component (`"use client"`)
- Root layout sets a `title.template` (`"%s | Seads Singapore"`) so subpage titles stay
  consistent without repeating the suffix everywhere
- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt`
  from `NEXT_PUBLIC_SITE_URL` (see `docs/ENVIRONMENT.md`)

## Future Expansion Notes

Potential next additions:

- Dynamic route for individual stories (`/blog/[slug]`)
- Backend/CMS-driven route generation once a real data source is chosen
