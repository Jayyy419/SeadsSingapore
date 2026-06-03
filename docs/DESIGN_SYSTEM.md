# Design System (Sage Civic)

## Visual Direction

- Tone: cinematic, youth-focused, civic credibility
- Base palette: Sage Civic
- Shape language: highly rounded cards/chips/buttons
- Texture: subtle film-grain overlay
- Motion: scroll choreography + parallax + magnetic CTAs + spark cursor trail

## Color Tokens

Defined in [src/app/globals.css](../src/app/globals.css):

- `--background`: page background
- `--background-overlay`: translucent nav backdrop
- `--foreground`: primary text + dark surfaces
- `--foreground-soft`: border and dividers
- `--surface`: white cards and panels
- `--surface-2`: tinted section background
- `--surface-soft`: footer secondary text
- `--muted`: body secondary copy
- `--brand`: primary accent / CTA
- `--brand-deep`: CTA hover
- `--brand-soft`: thematic section tint

## Typography Pairing (Editorial)

Set in [src/app/layout.tsx](../src/app/layout.tsx):

- Sans: Manrope (`--font-manrope`)
- Display/Headings: Source Serif 4 (`--font-source-serif`)

## Component Rules

### Header

- Shared across all pages via [src/components/site-header.tsx](../src/components/site-header.tsx)
- Desktop: dropdown groups for About and Programs
- Mobile: hamburger drawer with grouped links

### Hero

- Parallax decorative layers
- Primary CTA always points to Programs
- Secondary CTA can point to Media or Events

### Sections

- Use alternating section backgrounds:
  - plain `section-card`
  - tinted wrappers with `var(--surface-2)` or `var(--brand-soft)`

### Media

- Masonry gallery with captions + dates
- Fullscreen lightbox on click
- Reusable component: [src/components/media-masonry.tsx](../src/components/media-masonry.tsx)

## Motion System

### Cursor Spark Trail

- [src/components/cursor-smoke.tsx](../src/components/cursor-smoke.tsx)
- Uses green/amber subtle particle trail
- Disabled for reduced motion and coarse pointer devices

### Scroll Progress

- [src/components/scroll-progress.tsx](../src/components/scroll-progress.tsx)
- Thin top progress indicator

### Reveal Choreography

- [src/components/motion-choreography.tsx](../src/components/motion-choreography.tsx)
- Apply `data-reveal` on section roots

### Magnetic CTA

- [src/components/magnetic-effects.tsx](../src/components/magnetic-effects.tsx)
- Apply `data-magnetic="true"` to key buttons/links

## Photo Content Management (Without VS Code)

You can update gallery content in production workflow without editing code by replacing files under `public/photos/` and deploying.

Current source list is in [src/content/media.ts](../src/content/media.ts).

Future recommendation:

1. Move media metadata + assets to Sanity CMS.
2. Keep same UI components and swap data source.
3. Non-technical team can manage images/captions/dates from browser UI.
