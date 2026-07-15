# Routes and Pages

## App Router Pages

Defined under `src/app`:

- `/` -> `src/app/page.tsx`
- `/about` -> `src/app/about/page.tsx`
- `/blog` -> `src/app/blog/page.tsx`
- `/blog/[slug]` -> `src/app/blog/[slug]/page.tsx` — DynamoDB-backed story detail, dynamically
  rendered (not SSG — see "Route Content Strategy" below)
- `/blog/submit` -> `src/app/blog/submit/page.tsx` — community story submission form
- `/contact` -> `src/app/contact/page.tsx`
- `/donate` -> `src/app/donate/page.tsx`
- `/events` -> `src/app/events/page.tsx`
- `/events/[slug]` -> `src/app/events/[slug]/page.tsx` — DynamoDB-backed event detail + RSVP
- `/events/[slug]/qr` -> QR code image for the event's detail page URL
- `/events/calendar.ics` -> subscribable calendar feed for all events (`src/lib/ics.ts`)
- `/join` -> `src/app/join/page.tsx`
- `/media` -> `src/app/media/page.tsx`
- `/partners` -> `src/app/partners/page.tsx`
- `/privacy` -> `src/app/privacy/page.tsx`
- `/programs` -> `src/app/programs/page.tsx`
- `/programs/[slug]` -> `src/app/programs/[slug]/page.tsx` — DynamoDB-backed program detail
- `/team` -> `src/app/team/page.tsx`

## Admin Routes

Defined under `src/app/admin`, gated by `src/proxy.ts` (redirects to `/admin/login` without a
valid session cookie) — see `docs/ARCHITECTURE.md`'s "Admin Panel" section for what each does:

- `/admin` -> dashboard (links to every section below)
- `/admin/login` -> shared-password login form
- `/admin/team`, `/admin/partners`, `/admin/programs`, `/admin/blog`, `/admin/events`,
  `/admin/impact-metrics` -> content CRUD list pages (create/edit/delete/reorder)
- `/admin/submissions` -> interest-form + event RSVP entries (read/delete)
- `/admin/stories` -> community story submission moderation queue (approve/reject)
- `/admin/audit-log` -> record of every admin write action
- `/admin/settings` -> change the admin password
- `/admin/api/*` -> Route Handlers proxying login/logout to the Lambda and setting/clearing
  the session cookie (not admin-content routes — internal to the auth flow)

All of `/admin/*` is disallowed in `robots.ts`.

## Shared Route Wrapper

Most non-home routes use:

- `src/components/site-shell.tsx`

This provides:

- Sticky header with navigation
- Optional route title/subtitle hero
- Shared footer

## Route Content Strategy

- Most list pages (team, partners, programs, blog, events) fetch live from the Lambda's
  DynamoDB-backed API client-side, via `src/lib/use-*.ts` hooks — each starts from bundled
  static seed data and swaps in the live result once it resolves, so there's never a blank
  loading state.
- `[slug]` detail pages (`/blog/[slug]`, `/events/[slug]`, `/programs/[slug]`) fetch
  server-side for `generateMetadata`/JSON-LD, and can't use `generateStaticParams` (content is
  admin-editable at runtime, not known at build time) — these routes render dynamically per
  request rather than via SSG.
- Homepage uses local content plus interactive filtering and form actions.

## SEO

- Every subpage exports its own `metadata` (title/description); the homepage inherits the
  root layout's default since it's a client component (`"use client"`)
- Root layout sets a `title.template` (`"%s | Seads Singapore"`) so subpage titles stay
  consistent without repeating the suffix everywhere
- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt`
  from `NEXT_PUBLIC_SITE_URL` (see `docs/ENVIRONMENT.md`)

