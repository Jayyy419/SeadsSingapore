# Changelog

All notable changes to this project should be documented in this file.

This format is inspired by Keep a Changelog and uses a date-based release style.

## [2026-07-10]

### Changed

- Rebranded the site from Spark SG to Seads: dictionary-entry homepage hero, vine/flower-bloom
  nav header, light/dark theme toggle, and an EN/MN/BM/HI locale switcher with hover tooltips,
  ported from a Claude Design prototype
- Added dark-theme CSS tokens and dedicated `--inverse-bg`/`--inverse-fg` tokens for
  always-dark sections/CTAs
- Rebranded all remaining routes (about, programs, events, team, contact, partners, donate,
  media, blog, join), `siteContent.ts`, the shared footer, and page metadata
- Removed the Spark-era cinematic motion system (`cursor-smoke.tsx`, `motion-choreography.tsx`,
  `magnetic-effects.tsx` and their `hero-glow`/`cinematic-layer`/`magnetic`/`[data-reveal]`
  CSS) — kept only the scroll-progress bar

## [2026-06-02]

### Added

- Added documentation set under `docs/`:
  - `README.md`
  - `ARCHITECTURE.md`
  - `TECH_STACK.md`
  - `ENVIRONMENT.md`
  - `ROUTES.md`
  - `DEPLOYMENT.md`
  - `CHANGELOG.md`
- Added visual reference board:
  - `design-reference.html`

### Changed

- Added `vercel.json` with explicit framework setting:
  - `"framework": "nextjs"`
- Stabilized production deployment behavior and alias routing for:
  - `sparksg.vercel.app`

### Fixed

- Resolved Vercel production `NOT_FOUND` issue caused by framework/output misconfiguration at project level
- Re-deployed and remapped alias to a healthy production deployment

## [2026-05-15]

### Added

- Initial Next.js project scaffold and base route structure
- Core site pages for SparkSG content sections
- Local typed content module and Sanity-ready query/client utilities
