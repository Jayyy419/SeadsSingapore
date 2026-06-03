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

## Future Expansion Notes

Potential next additions:

- Dynamic route for individual stories (`/blog/[slug]`)
- CMS-driven route generation (Sanity-backed)
- SEO metadata per route via route segment metadata exports
