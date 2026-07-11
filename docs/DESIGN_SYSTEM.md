# Design System (Seads Editorial)

## Visual Direction

- Tone: calm, editorial, dictionary/etymology framing — "Seads /si:dz/" as a defined word
- Base palette: sage green + terracotta accent, paper-toned backgrounds
- Shape language: highly rounded cards/chips/buttons
- Texture: subtle film-grain overlay (`body::before` in `globals.css`)
- Motion: a single thin scroll-progress bar plus the nav's hover bloom — no parallax,
  magnetic cursor pull, or particle trail

## Color Tokens

Defined in [src/app/globals.css](../src/app/globals.css), each with a `:root[data-theme="dark"]`
override:

- `--background` / `--background-overlay`: page background / translucent nav backdrop
- `--foreground` / `--foreground-soft` / `--foreground-strong`: primary text, hairline borders,
  stronger borders — flips with theme, so don't use it for something that must always read dark
  (see `--inverse-bg` below)
- `--surface` / `--surface-2` / `--surface-soft`: cards, tinted section backgrounds, footer text
- `--muted`: body secondary copy
- `--brand` / `--brand-deep` / `--brand-soft`: primary sage accent, its hover/deep tone, and a
  thematic section tint
- `--accent`: terracotta accent used for eyebrows, tags, and the interest-form submit button
- `--footer-bg` / `--footer-fg` / `--footer-muted`: the footer's own always-dark palette
- `--inverse-bg` / `--inverse-fg`: for sections/CTAs that must always render dark regardless of
  site theme (the About/etymology strip, the Get Involved section, dark pill buttons) — use these
  instead of `var(--foreground)` for that purpose, since `--foreground` intentionally inverts
  under dark mode and using it for an "always dark" surface will wash out to near-white

## Typography Pairing (Editorial)

Set in [src/app/layout.tsx](../src/app/layout.tsx):

- Sans: Manrope (`--font-manrope`)
- Display/Headings: Source Serif 4 (`--font-source-serif`) — applied globally to `h1`/`h2`/`h3`
  and `.font-display`

## Component Rules

### Header

- Shared across all pages via [src/components/site-header.tsx](../src/components/site-header.tsx),
  geometry helpers in [src/lib/vine.ts](../src/lib/vine.ts)
- A vine SVG spans the full nav width with small decorative sprigs
- Desktop: grouped nav (Home / Get Involved / Newsroom / Who We Are) — hovering a group with
  children blooms a flower of labeled sub-link petals grown from a seed anchor
- Utility cluster: locale switcher (EN/MN/BM/HI, with hover tooltips showing full language names)
  and a light/dark theme toggle, both persisted to `localStorage`
- Mobile: hamburger drawer with grouped links, locale switcher, and theme toggle
- Active nav state is derived from the route via `usePathname()`, not passed in as a prop

### Hero

- Dictionary-entry style: "Seads /si:dz/" with numbered definitions, no parallax layers
- Primary CTA always points to Programs; secondary CTA points to About/Our Story

### Sections

- Use alternating section backgrounds:
  - plain `section-card`
  - tinted wrappers with `var(--surface-2)` or `var(--brand-soft)`
  - always-dark wrappers with `var(--inverse-bg)` (About/etymology, Get Involved)

### Media

- Masonry gallery with captions + dates
- Fullscreen lightbox on click
- Reusable component: [src/components/media-masonry.tsx](../src/components/media-masonry.tsx)

## Motion System

### Scroll Progress

- [src/components/scroll-progress.tsx](../src/components/scroll-progress.tsx)
- Thin top progress indicator, the only ambient motion left site-wide

### Nav Bloom

- Implemented inline in `site-header.tsx` via CSS `@keyframes seads-petal-grow/shrink`,
  `seads-seed-pop/shrink`, `seads-label-rise/fall` (defined in `globals.css`)
- Triggered by hover/mouse-leave on a nav group with children; a leaving group plays the
  shrink/fall animation before unmounting instead of vanishing instantly

## Photo Content Management (Without VS Code)

You can update gallery content in production workflow without editing code by replacing files under `public/photos/` and deploying.

Current source list is in [src/content/media.ts](../src/content/media.ts).

Future recommendation:

1. Move media metadata + assets to a real backend/CMS once one is chosen (media files to
   object storage such as S3, metadata to a database or headless CMS).
2. Keep the same UI components (`MediaMasonry`) and swap only the data source in
   `src/content/media.ts` for a fetch/query call.
3. Non-technical team can manage images/captions/dates from a browser UI instead of editing code.
