# Changelog

All notable changes to this project should be documented in this file.

This format is inspired by Keep a Changelog and uses a date-based release style.

## [2026-07-19] (34)

### Added — a 4-way audit round (security/performance/QOL/feature ideation): fixes plus 3 new features

Found by 4 parallel audits scoped to only the surfaces added in the last two rounds
(donations, translations, media/testimonials/FAQ, submissions search/export, announcement
banner) rather than re-auditing anything already covered. One security fix, five QOL/perf
fixes, and three new features building on existing infra with no new tables beyond one small
addition.

- **Admin-supplied social/announcement links had no scheme allowlist** — `social-links.tsx`
  and `announcement-banner.tsx` rendered `social.*`/`announcement.linkUrl` directly as
  `<a href>` with only a length cap on the backend. A compromised admin password could have
  planted a `javascript:` URI that ran in every visitor's browser on click. Added
  `isSafeUrl()` on both the Lambda (`SITE_CONFIGS.social.urlFields`,
  `.announcement.relativeUrlFields` — the banner's link intentionally allows relative paths
  like `/join`) and the frontend (`src/lib/safe-url.ts`) as defense in depth.
- **Header vine recomputed its SVG path on every raw `resize` event** — a drag-resize could
  fire dozens of uncoalesced rebuilds a second. Coalesced `site-header.tsx`'s resize handler
  to one `requestAnimationFrame` per frame.
- **Admin dashboard cards were stale** — Media/Testimonials/FAQ/Site settings (all real
  routes, all in the nav dropdowns) had no card on `/admin`. Added the missing four, plus a
  card for the new Analytics page below.
- **Cancelling an event had no confirmation** despite being more consequential than delete
  (public banner, RSVPs closed) — the status `<select>` just saved with everything else on
  "Save." Added `EventSaveButton`, which confirms only when the save would actually change
  status to `cancelled`, so editing an already-cancelled event's other fields doesn't nag.
- **The Translations section gave no completeness signal** — same collapsed text whether 0 or
  3 locales were filled in, so checking status meant expanding every item. Added
  `countTranslatedLocales()` (any non-empty field counts a locale as touched) and a `(N/3)`
  badge in the summary, wired into all 5 forms that use it (Events/Team/Programs/
  Impact-metrics/Blog).
- **CSV export gave zero feedback until the browser's download UI appeared.** Replaced the
  plain `<a href>` with `ExportCsvButton` (client-side `fetch` + blob download), which shows
  "Exporting…" for the real duration of the request.
- **Added `/my-activity`** — a public, email-keyed lookup so a volunteer juggling multiple
  events/applications can see their own RSVP/submission history without an account. New
  Lambda route `POST /my-activity` filters the existing submissions table by email
  (IP-rate-limited at 20/10min, since — unlike the admin view — this is reachable by anyone
  who knows an email); no new table.
- **Added `/admin/analytics`** — submissions-over-30-days, submissions-by-type, and
  event RSVP fill-rate, all computed from data already in `/internal/submissions`,
  `/internal/events`, and `/internal/story-submissions` (`aggregate.ts`'s pure functions).
  Plain CSS bars, no charting dependency.
- **Added day-of event check-in** — `/admin/events/[slug]/check-in` lists an event's RSVPs
  with a toggleable "Check in" action and a live headcount in the page subtitle, replacing a
  paper sign-in sheet. New `attended` boolean on submission rows, set via
  `PATCH /internal/submissions/{id}/attendance`; new `GET /internal/events/{slug}/rsvps` for
  the roster. Scoped down from the original "scan a personal QR code" idea — the QR
  infrastructure already exists per-event, but a distinct per-attendee QR would mean new
  email-template work; the list+toggle delivers the actual ask (no more paper sheets, a live
  count) without that additional surface.

### Added — a product/feature audit round: donations, translations, and 7 new site surfaces

Found by a 4-way parallel product audit (visitor journey/conversion, admin workflow
ergonomics, static-content gaps, engagement/communications) — the first audit round this
session focused on missing features and content-ownership gaps rather than technical
correctness. New DynamoDB table `seads-site-content` (single-table grab-bag for media gallery
items, testimonials, FAQ entries, and singleton config blobs, keyed by a `type#uuid`/
`config#id` `itemId`) backs most of this.

- **Donate page was a dead end** — no payment mechanism existed at all, just "coming soon."
  Added admin-configurable PayNow (QR image upload + PayNow ID + instructions,
  `/admin/site-settings`) with an `enabled` flag — /donate keeps the original coming-soon
  card until an admin fills everything in and flips it on.
- **The 4-locale i18n was silently defeated for all admin content**: neither the admin forms
  nor the Lambda's update handlers ever accepted zh/ms/hi text, so every non-English visitor
  saw English on every admin-created item. Added `applyLocalized()` to the Lambda (reads
  `<field>Zh`/`<field>Ms`/`<field>Hi` payload keys) and a collapsible "Translations" section
  to every content admin form (Team/Events/Programs/Blog/Impact-metrics).
- **No submitter-facing email existed** — RSVPs, join submissions, and story submissions all
  notified only the org, never the person who submitted. Added confirmation emails (RSVP
  confirmed/waitlisted with event details, a join acknowledgment, and a story
  approved/rejected notification) — all best-effort, reusing the SES setup that already
  existed for org notifications.
- **Media gallery was left behind in the DynamoDB migration** — `/media` was still a
  hardcoded array of 6 placeholder SVGs literally reading "Add your photo here," the one
  content type that never got an admin surface. Added `/admin/media` (photo, caption,
  category, reorder) and switched `media-masonry.tsx` to the same static-fallback-then-
  live-swap pattern as everything else.
- **Testimonials were still static** — 3 hardcoded sample quotes with no admin surface. Added
  `/admin/testimonials`.
- **No social links or newsletter signup anywhere** on the site — a real discoverability/
  retention leak for a youth org. Added admin-configurable social links (Instagram/TikTok/
  LinkedIn/Facebook/YouTube — only configured platforms render) and an email-only newsletter
  signup in both footers, storing into the existing submissions table as
  `interestType: "newsletter"` (zero new storage).
- **Events never expired**: the list sorted oldest-first with no upcoming/past distinction
  and no empty state. Split into upcoming (soonest first) and past (most recent first)
  sections; added a `status` field (`cancelled`/`postponed`) with a banner on the event's
  detail page, a badge on list cards, RSVPs disabled for cancelled events, and the
  corresponding `schema.org/EventCancelled`/`EventPostponed` JSON-LD status.
- **Admin submissions had no search, filter, or export** — with hundreds of rows, an admin
  couldn't find a specific person or produce an attendance/contact list without copying out
  of the browser. Added a search box (name/email/message), type/event filters (as URL query
  params, so they survive refresh and pagination), and a CSV export Route Handler under
  `/admin/submissions/export` (Excel-formula-injection-safe cell escaping).
- **No site-wide announcement capability** — "applications open" / "event moved" required a
  deploy. Added an admin-configurable banner (message, optional link, `enabled` flag) shown
  on every public page; dismissal is remembered in `localStorage` keyed by the message text,
  so editing the message re-surfaces it for everyone who dismissed the old one.
- **No FAQ page existed** despite a youth org fielding the same questions repeatedly. Added
  `/faq` (admin-editable question/answer pairs, native `<details>` accordion) plus footer/nav
  links.
- **Admin session expiry mid-edit dumped to Next's generic error screen** with no
  explanation. Added `src/app/admin/error.tsx` explaining the likely cause (8-hour session
  expired) with a direct link back to login. Also added "View on site ↗" links next to
  Team/Programs/Events/Blog admin items so an admin can quickly check a change without
  hunting for the public URL.
- **Image upload rejected any photo over 5MB** with no help — a typical modern phone photo
  routinely exceeds that. Added client-side canvas downscaling (longest edge capped at 2000px,
  re-encoded as JPEG at 0.85 quality) before the size check now runs a second time; only
  animated GIFs (which a canvas redraw would freeze to one frame) still get a hard rejection.
- **Blog stories had no share mechanism, no visible date, and no way to pass a story along**
  short of copying the URL bar by hand. Added copy-link + native-share-or-WhatsApp-fallback
  buttons and a visible "Updated" date (from the existing `updatedAt` field) on story detail
  pages.
- Extended the Playwright suite by 5 tests (FAQ rendering, announcement dismissal/persistence,
  conditional social links, both donate-page states) — all mock `GET /site-content` rather
  than depending on live admin-configured data, keeping the suite deterministic.

### Fixed — post-merge: `GET /site-content` returning 500 in production

The Lambda deploy for the above (CI green, `node --check` passed) shipped code referencing
`process.env.SITE_CONTENT_TABLE`, but the new env var itself was never set on the live
function — creating the DynamoDB table and updating `iam-policy.json` both happened, setting
the actual Lambda environment variable didn't. Caught immediately via a live smoke check
right after the "deploy succeeded" CI result (`GET /site-content` → `500`, CloudWatch showing
`ValidationException: Value null at 'tableName'`), fixed with one
`aws lambda update-function-configuration` call, confirmed live in under 2 minutes. See
`docs/LEARNING_GUIDE.md` Part 18 for the full writeup and `backend/interest-form/README.md`'s
env-vars section for the reminder this earned about the three separate steps a new table
needs.

## [2026-07-15] (32)

### Fixed — race conditions, a resilience gap, CI safety net, and doc rot found by a 5-way parallel audit

Found by a 5-way parallel audit (DevOps/infra, docs accuracy, accessibility beyond alt text,
public-page resilience/business logic, testing/CI coverage) — the fourth such audit this
session.

- **Event RSVP capacity had no server-side enforcement at all**: `handleSubmitInterest` wrote
  every RSVP unconditionally, so a "capacity: 20" event could be overbooked without limit —
  capacity was purely a UI label. Fixed with an atomic conditional DynamoDB update (`ADD
  rsvpCount` gated by `attribute_exists(slug) AND (attribute_not_exists(capacity) OR rsvpCount
  < capacity)`) so the increment-and-check happens as one indivisible write — two simultaneous
  RSVPs can't both read "1 spot left" and both succeed. A full event still accepts the
  submission (matching the existing "Join Waitlist" UX, which resubmits through the same
  endpoint) but is recorded `rsvpStatus: "waitlisted"` instead of `"confirmed"`, surfaced as a
  badge on `/admin/submissions`.
- **Slug creation was a TOCTOU race** across all 5 slugified entity types (events/team/
  partners/programs/stories, plus impact metrics): a `GetCommand`-then-check before the
  `PutCommand` meant two concurrent creates deriving the same slug could both pass the check
  and the second write would silently overwrite the first. Added a shared
  `putIfSlugAvailable()` helper using `ConditionExpression: attribute_not_exists(slug)` so the
  write itself is atomic — the loser now gets a clean `409` instead.
- **Server-side `[slug]` detail-page fetches had no try/catch**: `getEvent`/`getProgram`/
  `getStory` in `events|programs|blog/[slug]/page.tsx` only guarded `res.ok`, so a thrown
  network error (DNS failure, timeout) would propagate as an unhandled rejection out of
  `generateMetadata`, taking down the whole page (header/footer included) instead of falling
  back gracefully like the client-side hooks already did. Wrapped all three in try/catch.
- **Lambda deploys had zero validation gate**: `deploy-interest-form-lambda.yml` shipped
  straight to the live Lambda on every push to `main` touching `backend/interest-form/**`,
  with no lint or even a syntax check — the exact class of mistake that nearly shipped a
  duplicate-`const` outage earlier this session. Added a `node --check index.mjs` step before
  the deploy.
- **No persisted test suite existed anywhere**: every prior verification pass this session was
  a one-off Playwright script, run once against a local build and discarded. Added
  `@playwright/test`, a 19-test smoke suite under `e2e/` (public page rendering, 404 handling,
  the skip link, the new lightbox focus trap, admin auth redirect + rejected-login error), and
  a `test` npm script wired into `ci.yml`. Every test mocks the interest-form API instead of
  hitting the live Lambda, so the suite is safe to run unattended on every push/PR.
- **Media lightbox had no real focus trap**: `role="dialog" aria-modal="true"` alone doesn't
  stop Tab from reaching the masonry grid behind the overlay. Added focus-on-open (first
  focusable element), Tab cycling within the dialog, focus-restore-on-close to the triggering
  photo, and `inert` on the rest of the page while open.
- **No skip-to-main-content link** anywhere — keyboard users had to tab through the full nav
  on every page. Added one to both `SiteShell` and `AdminShell`, localized on the public site.
- **`--muted` text (`#6b7280`) on `--surface-2` (`#eef3ee`) measured ~4.3:1 contrast**, just
  under the 4.5:1 AA threshold for normal text. Darkened to `#4b5563` (one step further down
  the same gray scale), now ~6.7:1.
- **Admin login password field had only a `placeholder`**, no accessible name once typed into
  (a classic anti-pattern, since placeholder text isn't reliably announced). Added
  `aria-label`. Also added `<caption>` to the two admin tables (`submissions`, `audit-log`)
  that had none.
- **Event JSON-LD `startDate` parsed via server-local midnight** (`new Date(event.date)`),
  which could shift the reported date by a day depending on the render server's timezone.
  Reused the same UTC-explicit parser the `.ics` calendar feed already had
  (`parseEventDate`, exported from `src/lib/ics.ts`).
- **Docs were significantly stale**: `ARCHITECTURE.md` still described a pre-database,
  single-table, no-admin-panel site; `ROUTES.md` was missing most public routes and every
  `/admin/*` route; `TECH_STACK.md` flatly claimed "no auth, database beyond DynamoDB, or CMS
  yet"; both READMEs were missing most of the Lambda's env vars; the root `README.md` was
  still untouched `create-next-app` boilerplate. Rewrote all of the above to match the actual
  system (10 DynamoDB tables, the admin panel, S3, the audit log, current deploy target).
- **DynamoDB PITR** was confirmed live on all 10 tables via `aws dynamodb
  describe-continuous-backups` (a documentation gap, not an actual infra gap — only 3 of 10
  had this confirmed anywhere in the docs before).
- Added `.github/CODEOWNERS` and PR/issue templates — a repo with branch protection but no
  default reviewer or structured template had a real hygiene gap here.

## [2026-07-15] (31)

### Fixed — a stored XSS gap in JSON-LD, plus a round of admin UX and SEO/a11y fixes

Found by a 4-way parallel audit (i18n, security, performance/SEO, admin UX) after the
Team/Partners/Programs/Stories admin-editable batch shipped.

- **Stored XSS via JSON-LD**: `blog/[slug]` and `events/[slug]` inject admin-editable fields
  into a `<script type="application/ld+json">` tag via `JSON.stringify`, which doesn't escape
  `<` — a title containing `</script><script>...` could break out and execute. Added a shared
  `safeJsonLdString()` helper (`src/lib/json-ld.ts`) that escapes `<` to `<` (valid inside
  a JSON string, parses back identically) and used it everywhere JSON-LD is rendered, including
  the previously-safe static organization JSON-LD in the root layout, for consistency.
- **Reordering**: Team, Partners, Programs, and Impact metrics all sort by an `order` field
  that was previously set once at creation and never editable — the only way to reorder was
  delete-and-recreate, which also changes the slug. Added an "Order (lower shows first)" input
  to each entity's edit form, and the Lambda's four `handleUpdate*` handlers now accept and
  persist it.
- **Delete confirmation**: no admin delete button anywhere had a confirmation step — one
  misclick permanently removed a team member, program, story, etc. Added a shared
  `ConfirmSubmitButton` component (native `confirm()` dialog before the action fires) and used
  it on all 8 admin pages with a delete action.
- **Fetch-error vs. empty state**: every admin list page's data-fetch helper collapsed a
  failed request to the same empty array as "genuinely zero items," which could read to an
  admin as "all my content got deleted." Added a shared `AdminFetchError` banner and changed
  all 9 list-page fetchers to report success/failure separately.
- **`<html lang>` never updated with the selected locale** — always "en" regardless of what a
  visitor picked, since the server can't know a stored client preference before first paint
  and nothing corrected it after. `LocaleProvider` now syncs `document.documentElement.lang`
  whenever the active locale changes.
- **Canonical URLs**: added `alternates.canonical` to every static page and both dynamic
  `[slug]` route types — previously unset anywhere, which risks duplicate-content indexing if
  the site ever moves off its current amplifyapp.com URL.
- **Remaining hardcoded English strings** localized: the "portrait photo" placeholder, the
  media gallery's "All" filter label, and the admin login page (previously the one page in the
  `/admin` tree a logged-out visitor could actually see, and the only one with zero i18n).
- **Content photos migrated to `next/image`**: Team/Partners/Programs/Stories photos were all
  raw `<img>` tags with no lazy-loading, responsive sizing, or format optimization. Added
  `images.remotePatterns` for the S3 media bucket to `next.config.ts` and swapped every
  content-photo `<img>` to `next/image` (`fill` for fixed-aspect-ratio boxes, explicit
  `width`/`height` for partner logos' variable aspect ratio). Left the admin upload widget's
  own preview thumbnail as a raw `<img>` — deliberate, already-documented exception, since it's
  an admin-only preview of a file just uploaded from the admin's own device.
- **Audit log now records which fields changed**, not just which entity — added a
  `diffFields()` helper each `handleUpdate*` handler uses to compare old vs. new values (the
  admin forms always submit every field regardless of what was touched, so "which keys are in
  the payload" wouldn't have answered "what changed"; only comparing values does).
- **S3 media bucket configuration committed as IaC**: `media-bucket-policy.json` and
  `media-bucket-cors.json` in `backend/interest-form/` now document the bucket policy and CORS
  rules that were previously only described in prose, with `aws s3api` commands in the
  Lambda's README to apply/reproduce them. Also fixed a real bug found while writing that
  documentation: the README's "updating the IAM policy" instructions referenced the wrong
  policy name (`seads-interest-form-exec-policy`, a smaller pre-existing policy) instead of the
  one actually kept in sync with `iam-policy.json` (`seads-interest-form-policy`) — following
  the old instructions literally would have overwritten the wrong policy.

Verified with Playwright against a local production build talking to the live Lambda: team
member reordering (by slug, since reordering deliberately changes list position — confirmed
via `order` persisting across a save+reload+revert), partner creation, delete confirmation
(dialog message, cancel preserves the item, confirm deletes it — confirmed via the public API
before/after), audit log showing a changed-field list, the canonical tag, and `<html lang>`
switching from `en` to `zh` when the locale switcher is used. Cleaned up all test data
(`QOL Verify Test Partner`) from production DynamoDB afterward.

## [2026-07-15] (30)

### Added — dependency updates, admin dashboard links, S3 cleanup, login rate limiting

- Merged 3 Dependabot PRs: `actions/setup-node` 6→7, `react-dom` 19.2.4→19.2.7,
  `eslint-config-next` 16.2.6→16.2.10. Left the `eslint` 9→10 bump open — reproduced its CI
  failure locally: `eslint-config-next`'s bundled `eslint-plugin-react@7.37.5` calls
  `context.getFilename()`, an API ESLint 10 removed, so it crashes on every lint run. Upstream
  issue, not fixable here; commented on the PR explaining why and left it for Dependabot to
  keep current until `eslint-config-next` ships a compatible version.
- **Admin dashboard was missing links** to Team, Partners, Programs, Blog, and Audit log —
  all real pages, only reachable via the nav bar or a guessed URL. Added cards for all five to
  `/admin`'s `SECTIONS` array.
- **S3 orphan cleanup**: replacing or removing a photo/logo (Team, Partners, Programs, Stories)
  now deletes the old S3 object via a new `deleteMediaObjectIfOwned()` helper, and deleting an
  entity outright now deletes its photo too. Previously every replaced photo sat in the bucket
  forever, unreferenced. Added `s3:DeleteObject` to the Lambda's IAM policy for
  `seads-media/uploads/*`. Verified end-to-end with Playwright: uploaded photo A, replaced it
  with photo B (confirmed A was deleted from S3, B exists), then removed B via "Remove image"
  (confirmed B was also deleted).
- **Admin login rate limiting**: `handleAdminLogin` had no throttling at all, unlike the
  public interest-form/story-submission endpoints, which both rate-limit by IP/email via the
  existing `checkRateLimit()` helper. Added the same by-IP limiting (10 attempts / 10-minute
  window) to the shared admin password login. The Next.js proxy route
  (`/admin/api/login/route.ts`) previously collapsed every non-OK Lambda response into a
  hardcoded 401 "Incorrect password" — fixed to forward the real status/message so a 429 reads
  as "Too many attempts" instead of a misleading wrong-password message.
- **Community story submissions now notify admins by email** via the existing
  `NOTIFY_EMAIL`/SES setup — previously only the original interest-form submissions triggered
  a notification, so a new story sat in the moderation queue with nothing telling anyone to go
  look. Same best-effort, non-blocking send pattern as the existing notification.
- **Alt text**: team portraits, story photos, and program photos now use descriptive alt text
  (name/title) instead of `alt=""`. Partner logos and the admin upload widget's own preview
  already had appropriate alt text and were left as-is.

Confirmed unchanged and still not actionable: `npm audit`'s 3 moderate findings are the same
Next.js-internal-bundled `postcss@8.4.31` issue documented in an earlier entry — checked, and
even the latest Next.js 16.3.0 previews still bundle the same version, so there's no available
upgrade path yet.

## [2026-07-15] (29)

### Added — Stories (the staff-authored blog) made admin-editable

The last item from the feature/QOL review: the 4 stories on `/blog` were still hardcoded in
`siteContent.ts`. Added a new `seads-stories` DynamoDB table (deliberately separate from the
existing `seads-story-submissions` community-moderation queue — different shapes and
workflows, see `docs/LEARNING_GUIDE.md` Part 15), full CRUD (`GET/POST /internal/stories`,
`PUT/DELETE /internal/stories/{slug}`, public `GET /stories`), and a new `/admin/blog` admin
page (distinct from the existing `/admin/stories` moderation queue — the nav now labels that
one "Story submissions" to disambiguate). Existing story content was migrated into DynamoDB
via the same temporary-debug-route extraction technique used for Programs, preserving all 4
locales exactly.

Every public consumer that used to import the static `stories` array now fetches live via a
new `useStories()` hook (same static-fallback-then-live-swap pattern as the other entities):
`blog-content.tsx`, `blog/[slug]/story-detail-content.tsx` (with a `loaded`-gated `notFound()`,
same reasoning as the other detail pages), `blog/[slug]/page.tsx` (metadata + JSON-LD, dropped
`generateStaticParams`), `blog/[slug]/opengraph-image.tsx`, `blog/rss.xml/route.ts`, and
`sitemap.ts`. Stories also gained an optional `photo` field, editable via the shared
`AdminImageUpload` component, rendered on `/blog`, the story detail page, and (see below) the
homepage teaser.

### Fixed — homepage never used any of the live data hooks

Found while wiring up Stories: `src/app/page.tsx`'s Events/Programs/Stories/Team preview
sections were still importing the static `siteContent.ts` arrays directly, even though each
already had a live-fetching hook built for its own full page. An admin edit would show up
everywhere except the homepage teaser. Swapped all four sections onto their respective hooks
(`useEvents`/`usePrograms`/`useStories`/`useTeam`), with a fixed `slice(0, N)` cap per section
so the homepage keeps its "curated preview" layout instead of growing unbounded as admins add
content — see `docs/LEARNING_GUIDE.md` Part 15 for the full reasoning.

## [2026-07-15] (28)

### Added — Team, Partners, and Programs made admin-editable; audit log; media uploads

A broader feature/QOL review turned up a punch list of gaps. This entry covers the
infrastructure work; SEO/accessibility/pagination fixes are entry (27).

- **Audit log**: every admin write (create/update/delete across all entity types) now appends
  to a new `seads-admin-audit-log` DynamoDB table via a best-effort `logAudit()` helper —
  failures are logged but never block the write itself. Viewable at `/admin/audit-log`. See
  `docs/LEARNING_GUIDE.md` Part 15 for the "best-effort logging" design reasoning.
- **Image/media uploads**: a new `seads-media` S3 bucket plus `POST /internal/upload-url`
  (presigned PUT URLs, 5MB cap, JPEG/PNG/WebP/GIF allowlist) lets admins upload photos
  directly from the browser to S3, bypassing the Lambda entirely for the actual file bytes. A
  new `AdminImageUpload` component wraps the flow (validate → request presigned URL → PUT →
  store the resulting public URL in a hidden form field) and is reused across every admin form
  that needs a photo/logo. Fixed a CSP bug found only via a real browser: the S3 origin was
  missing from `connect-src`/`img-src` in `security-headers.ts`.
- **Team bios, Partners, and Programs are now admin-editable** (`/admin/team`,
  `/admin/partners`, `/admin/programs`), each backed by its own new DynamoDB table
  (`seads-team`/`seads-partners`/`seads-programs`) instead of the static `siteContent.ts`
  arrays, which now serve only as the static fallback for a new `useTeam()`/`usePartners()`/
  `usePrograms()` hook per entity (same static-fallback-then-live-swap pattern as
  `useEvents()`). Partners is new content — the site had no partners page before. Existing
  Programs content was migrated into DynamoDB via a temporary debug route (captured via curl,
  deleted before commit) rather than hand-retyped, preserving all 4 locales exactly.
  `/programs/[slug]` dropped `generateStaticParams` (no longer enumerable at build time) in
  favor of a server-side fetch, mirroring the Events migration.

New tables required IAM policy updates applied by the site owner via CloudShell, same process
as prior entries.

## [2026-07-15] (27)

### Added — SEO, accessibility, and pagination fixes from a feature/QOL review

- Fixed `sitemap.ts` to fetch live event/program/story slugs instead of only listing static
  top-level routes for events and programs (it already covered stories via the static array at
  the time).
- Disallowed `/admin` in `robots.ts` — the admin panel was previously crawlable.
- Removed the Vercel Web Analytics script (non-functional since the site moved to Amplify) and
  corrected the privacy policy's claim about analytics accordingly.
- Added `aria-label`s to the hamburger menu, theme toggle, and locale switcher.
- Added a `generateMetadata` export to `/blog/submit`.
- Added pagination (`AdminPagination` component, `page` search param) to every Lambda `Scan`-
  backed list endpoint and its corresponding admin UI, to bound response size as tables grow.
- Added a rendered preview ("how this will look on `/blog/{slug}`") to the story moderation
  queue, so reviewing a submission doesn't require imagining the final layout.
- Added per-route Open Graph images (`opengraph-image.tsx`) for program, event, and story
  detail pages, via a shared `buildOgImage()` helper in `src/lib/og-image.tsx`.
- Added per-page JSON-LD structured data (`Event`/`Article` schema.org types) to event and
  story detail pages.
- `/blog/submit` now reuses the shared `InterestForm` component instead of a hand-rolled form,
  after fixing the actual gap that had prevented reuse (a missing "unconfigured" state) rather
  than force-fitting a mismatched component.

## [2026-07-14] (21)

### Added — full admin CRUD, in-app password change, visual redesign

Follow-up to entry (20)'s auth fix: the admin panel could only edit existing rows and had no
way to change the shared password short of an AWS console edit. Added, all backed by the
interest-form Lambda (`backend/interest-form/index.mjs`) which remains the only place secrets
live:

- **DB-backed password + in-app change flow**: the password now lives hashed
  (`scryptSync`, random salt) in a new `seads-admin-config` table instead of only as the
  Lambda's `ADMIN_PASSWORD` env var. On first successful login against the bootstrap env-var
  value, it's transparently migrated into the table; from then on the env var is ignored.
  `PATCH /internal/admin-password` (current password required) backs a new `/admin/settings`
  page.
- **Impact metrics & events: create/delete**, not just edit. Events moved off the static
  `siteContent.ts` array entirely onto a new `seads-events` DynamoDB table (seeded from the 3
  original events), with full CRUD (`GET/POST /internal/events`, `PUT/DELETE
  /internal/events/{slug}`) and a public read-only `GET /events`. Every public consumer that
  used to import the static array now fetches live: `events-content.tsx`,
  `event-detail-content.tsx` (via a shared `useEvents()` hook with a static-fallback +
  `loaded` flag so a newly-created event doesn't 404 before the live fetch resolves),
  `/events/[slug]/page.tsx` (metadata), `/events/[slug]/qr/route.ts`, and
  `/events/calendar.ics/route.ts`. Since events are no longer enumerable at build time,
  `/events/[slug]` dropped `generateStaticParams` and is now fully dynamic.
- **Submissions & story submissions: delete**, alongside the existing approve/reject.
- **Visual redesign**: every `/admin/*` page now shares an `AdminShell` component (nav +
  logout header, consistent typography) reusing the main site's CSS custom properties instead
  of ad hoc unstyled markup.

New tables (`seads-admin-config`, `seads-events`) needed a corresponding IAM policy update on
the Lambda's execution role — applied by the site owner via CloudShell using a base64-encoded
single-line command, since multi-line heredoc pastes had repeatedly failed to fully execute in
that environment (only partial commands ran; verified via a follow-up `get-role-policy` call
showing the old policy, twice, before switching approaches).

### Fixed — two bugs found while verifying the above with Playwright

- **Admin nav prefetch waste**: `AdminShell`'s nav links had default Next.js `prefetch`
  behavior, which fires on every render since all 6 links are always visible in the header.
  Every admin page is `force-dynamic` and reads protected data, so each prefetch was a full
  extra round-trip to the Lambda per link per page view — multiplying load for no benefit
  (nobody benefits from a pre-warmed cache of a page that re-fetches live data anyway) and,
  during testing, was enough request volume on its own to trip API Gateway's 5rps/burst-10
  global throttle. Set `prefetch={false}` on all `AdminShell` nav links.
- **`useEvents()`/`useEventRsvpCounts()` silently never fetched if
  `NEXT_PUBLIC_API_BASE_URL` was unset**: every other consumer of that build-time env var in
  this codebase (`calendar.ics`, `qr/route.ts`, `[slug]/page.tsx`, `security-headers.ts`) falls
  back to the known API Gateway URL if it's missing; these two client hooks just returned
  early and stayed frozen on stale/empty data with no error, no console warning, nothing. Only
  caught because a local production build without the var set (deliberately, to mirror the
  worst case) left `/events` stuck on the static fallback while every other page correctly
  showed live data. Added the same hardcoded fallback both files were missing.

Verified via Playwright driving a real Chromium browser against a local production build
talking to the live Lambda: settings password change (then reverted), impact metric
create+delete, event create+edit+delete, event propagation to the public listing/detail/QR/ICS
routes, and submissions/stories page loads. One check (the public `/events` listing picking up
a newly-created event via its client-side fetch) couldn't be exercised from this sandbox — the
Lambda's CORS `ALLOWED_ORIGINS` allowlist correctly rejects requests from `localhost`, which
is the intended behavior, not a bug; the same code path was verified indirectly via the
server-rendered detail page and ICS feed, both of which picked up the new event correctly.
Cleaned up all test data (`Test Metric *`, `Verify Event *`) from production DynamoDB tables
after each verification pass.

## [2026-07-14] (20)

### Fixed — admin auth moved off Amplify env vars entirely (root cause found)

The real root cause of every admin-login symptom this session (CSP violation, then
"Incorrect password" with the actually-correct password): **Amplify Hosting's environment
variables for this app never reliably reach the deployed Next.js SSR compute's `process.env`
at request time**, regardless of value, regardless of being set at app level or branch level,
and regardless of attaching both an `iamServiceRoleArn` and a `computeRoleArn` (both now
attached — `seads-amplify-service-role`, trusted by `amplify.amazonaws.com`, policy
`AdministratorAccess-Amplify`). Confirmed with a temporary diagnostic endpoint
(`/admin/api/debug-env`, now removed) that reported every server-only var as unset even
immediately after a fresh deploy with correct app config. `aws ssm get-parameters-by-path`
under Amplify's expected `/amplify/<appId>/<branch>/` prefix returned zero results throughout
— the app-level config the AWS API reports back is never actually synced anywhere the running
compute can read it. `NEXT_PUBLIC_*` variables were never affected by this, since those are
resolved to literal strings in client bundles at *build* time (a completely different
mechanism from server-runtime `process.env`), which is also why nothing else broke visibly —
every server-side env var read elsewhere in the app happened to have a fallback matching the
real value.

Fix: stopped depending on Amplify env vars for anything security-sensitive. Moved
`ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to the interest-form Lambda's own environment
variables instead — which *have* worked reliably all session via a completely different,
well-established mechanism (`aws lambda update-function-configuration`). The Lambda gained
`POST /admin-login` (password → signed session token) and `POST /verify-session` (token →
valid/invalid), both intentionally public/unauthenticated since neither can be used to forge
or discover a valid token without already knowing the password. `/internal/*` routes now
require a valid session token (`X-Admin-Token` header) instead of the old static
`INTERNAL_API_KEY`, tying data-access authorization directly to being logged in rather than a
separate shared secret. The Next.js side (`src/lib/admin-session.ts`, `src/proxy.ts`,
`src/lib/internal-api.ts`, `src/app/admin/api/login/route.ts`) is now a thin, secret-free
proxy — verified by rebuilding and running the full login → dashboard → logout flow locally
with **zero** admin-related environment variables set at all, matching exactly what
production has (nothing), and it worked.

## [2026-07-14] (19)

### Fixed — "Incorrect password" with the correct password

After the `fetch()` fix, login reached the server correctly but still rejected the actual
`ADMIN_PASSWORD` value copied from the Amplify console. Most likely cause: a stray
space/newline picked up when copying the value out of the console's text field — the
comparison was a strict `===` with no normalization. Now trims both sides
(`src/app/admin/api/login/route.ts`) before comparing; verified locally that a
deliberately whitespace-padded password now succeeds while a genuinely wrong one still
correctly fails.

## [2026-07-14] (18)

### Fixed — admin login, for real this time

The previous entry's fix (explicit headers in `proxy.ts`) didn't resolve it in production —
same `form-action 'self'` violation on the same-origin login POST, confirmed still happening
after that deploy. Rather than keep guessing at *why* a same-origin form-action check was
failing without direct access to the production environment to inspect it, sidestepped the
directive entirely: `/admin/login` and the logout button now submit via `fetch()`
(`src/app/admin/login/page.tsx`, `src/components/admin-logout-button.tsx`) instead of a
native `<form method="POST">`. A `fetch()` POST is governed by the CSP's `connect-src`
directive, not `form-action` — and `connect-src` was already confirmed correct via the
earlier Playwright check. The login/logout Route Handlers changed from returning redirects to
plain JSON responses (`{ ok: true }` + Set-Cookie), with the client doing a full
`window.location.href` navigation afterward so `proxy.ts` re-evaluates with the fresh cookie.
Verified end-to-end with Playwright driving a real Chromium browser through login → dashboard
→ logout → redirected back to login, with zero console errors.

## [2026-07-14] (17)

### Fixed — admin login blocked by its own CSP in production

Reported: clicking "Log in" on `/admin/login` did nothing. Browser DevTools showed:
`Sending form data to '.../admin/api/login' violates the following Content Security Policy
directive: "form-action 'self'"` — on a same-origin form, which `'self'` should always permit.
Root cause not fully provable without direct production access, but the likely explanation is
that `next.config.ts`'s `headers()` doesn't reliably apply to responses that also pass through
`proxy.ts` (Next's middleware) in this Next.js version. Fixed defensively rather than chasing
the exact mechanism further: extracted the security headers into `src/lib/security-headers.ts`
and now set them explicitly on every response `proxy.ts` returns (the login/logout redirect
included), not just relying on `next.config.ts`. Verified locally that `/admin/login`, the
`/admin` → `/admin/login` redirect, and a normal page all carry the identical, correct header.

## [2026-07-14] (16)

### Added — custom admin panel

The site had no way to manage content short of editing `siteContent.ts` and redeploying.
Added a password-gated `/admin` section:

- **Auth**: a single shared password (`ADMIN_PASSWORD`, an Amplify env var) checked in
  `src/app/admin/api/login/route.ts`, which sets an HttpOnly/Secure/SameSite=Strict cookie
  containing an HMAC-signed, expiring session token (`src/lib/admin-session.ts`).
  `src/proxy.ts` (Next.js's renamed `middleware.ts` convention) gates every `/admin/*` route
  except the login/logout endpoints themselves. Deliberately no rate limiting on login — the
  password is a ~120-bit random value, not a memorable phrase, so brute force isn't a
  realistic concern; a memorable password would need one.
- **Data layer**: since Amplify's Next.js SSR compute has no IAM role of its own
  (`computeRoleArn` is unset — confirmed via `aws amplify get-app`), the admin panel's own
  Route Handlers/Server Actions proxy to the *interest-form Lambda* instead of talking to
  DynamoDB directly (`src/lib/internal-api.ts`, `backend/interest-form/index.mjs`'s new
  `/internal/*` routes, gated by a separate server-to-server `INTERNAL_API_KEY`, distinct from
  the admin's own session). Two new DynamoDB tables: `seads-impact-metrics`,
  `seads-story-submissions` (both PITR-enabled).
- **Impact metrics**: homepage's 4 stat tiles are now admin-editable and read live from
  DynamoDB via a public `GET /impact-metrics` (read-only, no key needed — same reasoning as
  the community-stories endpoint below) with a static-fallback client hook so the homepage
  never shows nothing while the fetch is in flight.
- **Live event RSVP counts**: interest-form submissions can now carry an `eventSlug`; a
  public `GET /event-rsvp-counts` computes real per-event counts, replacing the
  manually-maintained `spotsFilled` field added earlier today (kept as a fallback value only).
- **Submissions viewer** and **story moderation queue** (approve/reject community-submitted
  stories via `/blog/submit`, itself Turnstile+rate-limited like the interest form) round out
  the admin dashboard.

### Fixed — CSP never allowed the interest-form API origin

A real-browser Playwright check (not just curl) caught that `next.config.ts`'s
`connect-src` never included the interest-form API Gateway's origin — every fetch to it,
including the original "Get Involved" form submission itself, was likely being silently
blocked by the browser's own CSP enforcement in production this whole time. Fixed by adding
the origin (derived from `NEXT_PUBLIC_API_BASE_URL`) to `connect-src`. A reminder that
`curl`/server-side testing can't catch CSP violations — only a real browser can.

### Fixed — admin pages could break the CI build entirely

The 4 admin pages that fetch live data (`/admin/impact-metrics`, `/admin/events`,
`/admin/submissions`, `/admin/stories`) have no dynamic route segments, so Next.js tried to
statically prerender them at build time by default — which called `internalApiFetch()`
during `npm run build`, throwing because `INTERNAL_API_KEY` isn't (and shouldn't be) set in
CI. Added `export const dynamic = "force-dynamic"` to each; verified by rebuilding with the
exact CI environment (no server secrets) locally before pushing.

## [2026-07-14] (15)

### Security

- **GitHub secret scanning, push protection, and Dependabot security updates enabled**
  (repo is public, so these are free) via the repo settings API, plus a `gitleaks` GitHub
  Action (`.github/workflows/gitleaks.yml`) as a CI-level backstop that doesn't depend on
  GitHub's own scanner. Confirmed via a full `git log --all -p` scan that no credential
  pasted into chat this session ever actually landed in a commit.
- **Branch protection on `main`**: force-pushes and branch deletion now hard-blocked for
  everyone; merges require the `build` CI check. `enforce_admins` is left off so the repo
  owner can still push directly, matching the existing workflow — flagged as a deliberate
  choice, not an oversight, since flipping it on would require routing every change through
  a PR with no second reviewer available.
- **`.github/dependabot.yml`** added for the Next.js app, the Lambda's own `package.json`,
  and GitHub Actions versions.
- **`/.well-known/security.txt`** (RFC 9116) added as a Next.js Route Handler (not a static
  file) so its `Canonical` URL stays correct via the same `NEXT_PUBLIC_SITE_URL` fallback
  pattern as `sitemap.ts`/`robots.ts`.
- **Per-IP/email rate limiting on the interest-form Lambda.** API Gateway's own throttle
  (5 rps / burst 10) is global across every caller — AWS WAF can't attach to HTTP APIs (see
  the "Why WAF turned out not to apply here" section of `LEARNING_GUIDE.md`), so there was
  no per-caller limit underneath it. Added a DynamoDB-backed fixed-window counter (10-minute
  buckets, 5/window per IP, 3/window per email) using `UpdateCommand`'s
  `ADD #count :incr` on an ordinary item in the same table, cleaned up via TTL (now enabled
  on the table's `ttl` attribute). Requires `dynamodb:UpdateItem` on the Lambda's execution
  role — the deploy pipeline only pushes code, not IAM policy, so this needs a manual
  `aws iam put-role-policy` run once with admin credentials (documented in
  `backend/interest-form/iam-policy.json`).

### Added — event capacity/waitlist, calendar/RSS feeds, WhatsApp, QR codes

- `EventItem` gained optional `capacity`/`spotsFilled` fields. When set, listing and detail
  pages show "X / Y spots filled" or a "Waitlist — event full" state that also relabels the
  RSVP form's button/heading. Manually maintained for now — real RSVP counts aren't tracked
  yet (see the open admin/CMS question in this same entry).
- Locale now auto-detects from `navigator.languages` on first visit (matching against the
  four supported locales by 2-letter prefix) instead of always defaulting to English —
  only when there's no stored `seads-locale` preference yet, so it never overrides an
  explicit choice.
- `/events/calendar.ics` — a single subscribable feed of every event (English-only; feeds
  have no per-viewer locale). `/blog/rss.xml` similarly for stories, with RSS auto-discovery
  wired into `/blog`'s metadata.
- WhatsApp deep links (`wa.me`) added alongside the existing form on event RSVP, program
  apply, and the contact page — the org's WhatsApp number lives in one place
  (`src/lib/whatsapp.ts`) so it's a one-line change if it's updated.
- Downloadable QR codes (`/events/[slug]/qr`, `/programs/[slug]/qr`, generated server-side
  via the `qrcode` package, no external QR API call — keeps this within the existing CSP's
  `img-src 'self' data:`) encoding a UTM-tagged URL (`utm_source=qr&utm_medium=print`) so
  scans from physical events/print materials show up distinctly in analytics.

### Known gap — no admin/CMS layer yet

Several of the above (live capacity counts, and the larger backlog item of live impact
metrics, volunteer certificates, and community-submitted stories) all need some
admin-managed data layer and auth that doesn't exist yet — the site is still fully static
content in `siteContent.ts`, hand-edited and redeployed via git. This is an open
architecture question, not an oversight; see the conversation/next entry once resolved.

## [2026-07-14] (14)

### Fixed — sitemap missing every detail page

`src/app/sitemap.ts` only ever listed the static top-level routes. Adding
`/blog/[slug]`, `/events/[slug]`, and `/programs/[slug]` in earlier work never
updated it, so all 23 detail pages were fully built and crawlable but absent
from `sitemap.xml` — invisible to search engines despite being real, linked
pages. Sitemap now derives the detail routes directly from `programs`,
`events`, and `stories` in `siteContent.ts`, so new content is picked up
automatically instead of needing a second manual edit.

### Added — event/program detail page QOL

- `/events/[slug]` and `/programs/[slug]` now have a "back to all ___" link,
  matching the pattern `/blog/[slug]` already had. Previously the only way
  back from a detail page was the browser back button.
- `/events/[slug]` now has an "Add to calendar" link that downloads a real
  `.ics` file (`src/lib/ics.ts`) for the event — an all-day event on the
  listed date, since the content model only stores a date, not a time.
  Parses the site's fixed `"DD Mon YYYY"` date format directly rather than
  relying on `Date` constructor string leniency, which isn't guaranteed
  consistent across browsers.

## [2026-07-13] (13)

### Added — full site localization

Previously the EN/中文/BM/HI locale switcher (prominent on every page) only ever translated
the homepage's body text and a handful of nav labels — every subpage, and most of the nav
chrome, stayed in English regardless of selection. Extended the existing client-side
mechanism (React state + `localStorage`, no URL/route changes — a deliberate scope decision;
see `docs/LEARNING_GUIDE.md` Part 11 for the tradeoff against proper `/en/`/`/zh/` URL-based
i18n) to cover the whole site:

- New `LocaleProvider`/`useLocale()` (`src/lib/locale-context.tsx`) — a shared context so
  every page, not just the homepage, can read/set the current locale. `SiteHeader` no longer
  owns locale state itself; `SiteShell`'s footer is now locale-aware too.
- Every subpage split into a Server Component `page.tsx` (keeps `metadata`/
  `generateStaticParams`, which can't coexist with `"use client"`) rendering a Client
  Component that does the actual translated rendering — `about/about-content.tsx`,
  `team/team-content.tsx`, etc., following the same pattern throughout.
- `src/content/siteContent.ts` restructured so every program/event/story/team-bio/
  testimonial/impact-metric field is a `LocalizedString` (`Record<Locale, string>`) instead
  of a plain string — real translated content for all of it, not just UI chrome.
- `src/content/i18n.ts` expanded from ~40 to ~150 keys covering every page's headings,
  labels, and CTAs.
- `InterestForm`'s interest-type dropdown and status messages are now translated; the
  Privacy page's mailto/Cloudflare links stay real, clickable links across all four
  languages via a small `linkify()` helper (translated sentences contain the untranslated
  email address / brand name as a literal substring, split around it).

**Caveat, same spirit as the Privacy Policy's:** these are real, careful translations, not
placeholder text — verified end-to-end across all four locales in this session (nav, forms,
dynamic detail pages, persistence across navigation). But this session isn't a native speaker
of Mandarin, Malay, or Hindi; a native-speaker review is worth doing before treating the
non-English copy as final, same as the Privacy Policy.

**Known limitation (accepted as part of the architecture choice):** non-English content is
not crawlable by search engines — Google only ever sees the English version, since there's
no separate URL per locale. Revisit with proper `/[locale]/` routing if multi-language SEO
becomes a priority.

## [2026-07-13] (12)

### Fixed — feature-level dead ends and non-functional UI

A survey of every content page turned up several instances of the same problem: a page
promising an interaction (a link, a described next step) that didn't actually exist.

- **`/join` was circular and had no form.** Its own copy described "submit your interest
  details" as step 2, but the page had no form — just a link to `/events`, which linked back
  to `/join`. Fixed by extracting the interest form into a reusable
  `src/components/interest-form.tsx` and embedding it directly on `/join` (and reusing it on
  every new detail page below), instead of the form only ever existing on the homepage.
- **Story cards on `/blog` weren't clickable at all**, and no story detail page existed
  anywhere in the site. Added `/blog/[slug]` with full story bodies; cards now link through.
- **Program cards weren't clickable either.** Added `/programs/[slug]` with full program
  detail, a "who it's for" callout, and an Apply CTA pre-filled with that program.
- **Every event's "Join" button led to the same generic form**, losing which event you
  wanted. Added `/events/[slug]` with an RSVP form pre-filled with that specific event
  (`prefillInterest`/`prefillInterestType` props on the shared form component).
- **The header's primary CTA button was "Donate," linking to a "coming soon" dead end**, on
  every single page. Changed to "Get Involved" → `/join`; Donate remains reachable from every
  footer, just no longer the site's top-billed action.

### Added

- Structured `interestType` field (Volunteering / Partnering / Attending an event / Other)
  alongside the existing free-text field — threaded through the form component, the Lambda
  (allow-list validated, never trusting the raw client value), DynamoDB, and the notification
  email subject line, so Seads staff can triage submissions without reading every one.
- Team member bios on `/team` (previously name + role only).
- A "Become a partner" CTA on `/partners` (previously static description cards with no next
  step).
- Extended `src/content/siteContent.ts` with `slug`/`body` fields on programs, events, and
  stories to support the new detail pages — all placeholder content, consistent with the
  rest of this project's demo data (see `docs/ARCHITECTURE.md`), not claims about real Seads
  activities.

## [2026-07-13] (11)

### Added

- Privacy Policy page (`src/app/privacy`), linked from both footers and added to the
  sitemap. Site collects name/email/message via the "Get Involved" form with zero privacy
  disclosure until now — a real gap for an org collecting personal data, not just polish.
  Content is grounded only in what's factually true about how this system actually works
  today (what's collected, that there are no cookies, where data is stored, that Cloudflare/
  Sentry are named as processors) — nothing fabricated (no invented retention period, no
  named Data Protection Officer). **This should still get a human review from whoever runs
  Seads before being treated as final** — it's an honest, working draft, not legal advice.

### Known gap surfaced while writing this

- DynamoDB has no TTL/automatic-deletion configured on `seads-interest-submissions` —
  submissions are retained indefinitely until someone manually deletes them. The privacy
  policy is worded to match this honestly ("kept for as long as reasonably needed... or
  until you ask us to delete it") rather than promising an automatic retention period that
  doesn't actually exist yet. Worth deciding on and implementing a real TTL later if Seads
  wants automatic expiry.

## [2026-07-13] (10)

### Fixed — production bug

- **The Content-Security-Policy never allowed `challenges.cloudflare.com`**, so every real
  visitor's browser has been silently blocking the Turnstile script since it shipped (2026-07-13
  (5)) — the widget never rendered, no token was ever sent, and every genuine form submission
  would have been rejected by the Lambda's bot check. This wasn't caught at the time because
  verification only checked the backend round-trip (a garbage token, sent directly via curl,
  bypassing the browser/CSP entirely) and the static HTML markup — never an actual browser
  render, since this sandbox's own network policy separately blocks Cloudflare's domain too,
  masking the CSP bug behind an unrelated, expected failure. Added `challenges.cloudflare.com`
  to `script-src`, `connect-src`, and a new `frame-src` directive (Turnstile renders its
  challenge in an iframe). Confirmed the fix with a real Playwright browser: no CSP violation
  is logged anymore for that domain (the request now correctly reaches the network layer,
  where it still fails *here* only because of this sandbox's separate, expected restriction).

### Added

- Frontend error tracking via Sentry (`@sentry/nextjs`) — client, server, and edge runtime
  config, plus `src/app/global-error.tsx` to catch errors in the root layout itself. Inactive
  until `NEXT_PUBLIC_SENTRY_DSN`/`SENTRY_DSN` are set (same graceful-no-op pattern as
  Turnstile/the interest-form endpoint); added the ingest endpoint to the CSP's `connect-src`
  ahead of time (as a wildcard across common regions, to be tightened once a real DSN exists).

## [2026-07-13] (9)

### Added

- `.nvmrc` + `package.json` `engines` field (`>=20 <21`) — nothing previously enforced that
  local dev, CI, and Amplify's build all use the same Node version; they happened to agree
  (20.x, matching the Lambda runtime) but nothing guaranteed it stayed that way.
- `NonprofitOrganization` JSON-LD structured data in the root layout — helps search engines
  understand and potentially enrich how the site appears in results. Only includes fields
  backed by real content already on the site (name, url, description, `hello@seads.sg`,
  Singapore as country) — no fabricated address or social links, since none exist yet.

## [2026-07-13] (8)

### Fixed

- Reconnected the Amplify–GitHub integration via the console's OAuth flow (installing the
  "AWS Amplify" GitHub App), closing the gap noted in the 2026-07-13 (4) entry — PR previews
  now auto-comment their preview URL directly on the PR instead of requiring a manual check
  in the Amplify console. Verified with a real test PR (#3): the bot commented the preview
  link, an "AWS Amplify Console Web Preview" check passed, and the preview environment was
  torn down automatically on close.
- Removed a stale webhook left over from the deleted `us-east-1` Amplify app — wasn't cleaned
  up automatically when that app was deleted during the region migration.

## [2026-07-13] (7)

### Added

- OpenGraph/Twitter card metadata — the site previously had no `og:`/`twitter:` tags at all,
  so sharing a link on social media (a real growth channel for a youth NPO) showed a bare
  fallback with no preview. Added a dynamically-generated branded share image
  (`src/app/opengraph-image.tsx`, via `next/og`'s `ImageResponse` — no external image asset
  needed, matches the site's actual brand palette) plus `openGraph`/`twitter` metadata in the
  root layout, and `metadataBase` (previously unset, which would have resolved the image to
  a broken/localhost URL in production).

### Fixed

- `sitemap.ts`/`robots.ts` fell back to the old, retired `seadssg.vercel.app` URL if
  `NEXT_PUBLIC_SITE_URL` was ever unset — updated to the current Amplify URL.

## [2026-07-13] (6)

### Added

- Custom branded 404 page (`src/app/not-found.tsx`) — previously unmatched routes fell
  through to Next.js's bare default page with no nav, footer, or branding.

### Removed

- Five unused default `create-next-app` scaffold SVGs from `public/` (`file.svg`,
  `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — never referenced anywhere in the
  codebase.

### Checked, no action needed

- Bundle size: ~836KB raw JS total across all chunks, no single route unusually heavy;
  dependencies are just Next/React/Vercel Analytics, nothing bloated.
- All `<Image>` usages already have `alt` text; no raw `<img>` tags anywhere.

## [2026-07-13] (5)

### Added

- Cloudflare Turnstile on the "Get Involved" form — bot check, verified server-side in the
  Lambda before anything is written to DynamoDB. Secret key stored in Secrets Manager
  (`seads/turnstile-secret-key`, matching the convention prepped earlier); site key is public
  and lives in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Verified end-to-end from this session: a
  garbage token round-tripped to Cloudflare's `siteverify` from the Lambda and was correctly
  rejected with a 400. Widget/script only render when the site key is configured, and the
  Lambda fails open (skips the check) if the secret can't be loaded, so neither side can
  brick the form on a config gap — only an actual failed verification is rejected.
- Keyboard accessibility on the nav's flower-bloom dropdowns (`site-header.tsx`) — they were
  mouse-hover-only, so keyboard/screen-reader users could never reach a group's non-default
  children (e.g. "Partners" under "Get Involved"). Now opens on focus, closes on blur-outside,
  and Escape closes it and returns focus to the group link.
- Accessible labels (`required`, `aria-label`) on the interest form's inputs — previously
  relied on placeholder text alone, which isn't a reliable accessible name and disappears
  once the user starts typing. Submission status messages are now in an `aria-live="polite"`
  region so screen readers announce success/error after submit.

## [2026-07-13] (4)

### Added

- Enabled Amplify PR previews on `main` — opening a PR builds a temporary preview
  deployment instead of every change going straight to production. No preview-URL PR
  comment though, since the repo is connected via a PAT rather than the AWS Amplify GitHub
  App (see `docs/DEPLOYMENT.md`).

## [2026-07-13] (3)

### Added

- CloudWatch alarms on the interest-form Lambda's `Errors` and `Throttles` metrics
  (`seads-interest-form-lambda-errors`, `-throttles`), notifying an SNS topic
  (`seads-alerts`, `ap-southeast-1`) that emails `opsfin.sg@aseanyouthadvocates.org`.
- Uptime monitoring via two Route 53 health checks — `seads-api-health-check` against a new
  `GET /health` route (added to both the Lambda and API Gateway; returns `{"ok":true}` with
  no DB/SES calls) and `seads-frontend-health-check` against the Amplify site's `/` — each
  with a CloudWatch alarm. Route 53 health-check metrics only publish to CloudWatch in
  `us-east-1`, so those two alarms and a second `seads-alerts` SNS topic live there,
  separate from the Lambda alarms' `ap-southeast-1` topic.

### Investigated, not implemented

- AWS WAF for the interest-form API Gateway: not possible without extra infrastructure —
  WAF doesn't support API Gateway *HTTP APIs* (only REST APIs, ALBs, CloudFront, etc.), and
  fronting this with a CloudFront distribution just to attach WAF wasn't judged worth it for
  a single contact-form endpoint. Relying instead on the existing account-wide throttle plus
  Cloudflare Turnstile (planned) on the frontend form.

## [2026-07-13] (2)

### Added

- Tagged every Seads AWS resource (`Project=SeadsSingapore`, `Environment=Production`) and
  activated both as cost allocation tags, since this AWS account also hosts unrelated
  projects and spend wasn't previously separable. Added `seads-singapore-project-budget`
  ($30/month, filtered to just `Project=SeadsSingapore`) alongside the existing
  account-wide `seads-monthly-budget`, so there's now an accurate per-project spend view in
  addition to the account-wide safety net. (Most AWS resource names are immutable once
  created, so tags — not a rename — are the actual mechanism for project-level cost
  tracking; true billing separation would mean separate AWS accounts under an
  Organization.)

### Fixed

- Media masonry gallery was centering itself within its container instead of left-aligning,
  most visible after filtering to a category with few items. Left-aligned to match the rest
  of the site's layout.

### Fixed (2)

- The scoped IAM policy on `seads-singapore` was missing `iam:DeleteRole` /
  `DeleteRolePolicy` / `TagRole`, which blocked both known gaps below. Policy updated (by
  the account owner, since the identity that needs more IAM permissions can't grant them to
  itself); orphaned `seads-interest-form-lambda-role` deleted, and both live IAM roles
  (`seads-interest-form-lambda-role-sg`, `seads-gha-lambda-deploy`) tagged
  `Project=SeadsSingapore` + `Environment=Production` to match every other Seads resource.

## [2026-07-13]

### Added

- CI/CD for the interest-form Lambda: `.github/workflows/deploy-interest-form-lambda.yml`
  deploys on every push to `main` touching `backend/interest-form/**`, authenticating via a
  GitHub OIDC role (`seads-gha-lambda-deploy`) instead of storing AWS keys as GitHub secrets.
  Trust is scoped to `repo:Jayyy419/SeadsSingapore:ref:refs/heads/main`; permissions are
  scoped to `lambda:UpdateFunctionCode`/`GetFunction`/`GetFunctionConfiguration` on just this
  function (`backend/interest-form/gha-oidc-trust-policy.json` and `gha-deploy-policy.json`).
  The manual deploy steps in `backend/interest-form/README.md` remain as a fallback.
- Added `secretsmanager:GetSecretValue` (scoped to the `seads/*` name prefix) to the Lambda's
  execution role ahead of actually needing a secret, so adding one later needs no IAM change.

- CI workflow (`.github/workflows/ci.yml`): lint, typecheck, and build run on every PR and
  push to `main`, so a broken build is caught before Amplify tries to deploy it in production.

### Confirmed

- SES production access is approved — the interest-form notification email is no longer
  sandbox-limited (was 200/day, verified recipients only).

### Changed

- Moved the backend (Lambda, API Gateway, DynamoDB) and Amplify Hosting from `us-east-1` to
  `ap-southeast-1` (Singapore) — this project's audience is Singapore/SEA-based, and the
  interactive form backend (unlike Amplify's already-globally-edge-cached static assets)
  benefits directly from sitting in-region instead of round-tripping to Virginia. SES was
  re-verified and re-approved for production access in the new region too (see
  `docs/LEARNING_GUIDE.md` Part 7 for the full writeup, including what does and doesn't
  actually benefit from a region move). New Amplify app: `d2mrph1bcp6pjx`
  (`https://main.d2mrph1bcp6pjx.amplifyapp.com`). New API Gateway: `jztkgrm3lh`. Old
  `us-east-1` stack (Amplify app `d1s8x62kxpmlx7`, Lambda, API Gateway `h0bq61l33m`, DynamoDB
  table, SES identity, CloudWatch log group) deleted after the new region was verified working
  end-to-end.
- Restored the Media gallery's animated masonry layout — JS-computed absolute-positioned
  columns with a bounce-in entrance animation and smooth reflow when switching filter
  category, matching the original Claude Design prototype (`Media.dc.html`). This had been
  simplified to a plain CSS-columns layout when the site was first ported to Next.js and never
  fully restored. Used on both the dedicated `/media` page and the homepage gallery teaser.
- Clicking a nav group label ("Get Involved", "Newsroom") now goes to that group's first child
  alphabetically (Events, Media) instead of an arbitrary page. "Who We Are" already pointed to
  About, which was already first alphabetically.

### Known Gaps

- ~~Orphaned IAM role `seads-interest-form-lambda-role`~~ — resolved, see the 2026-07-13 (2)
  entry above.

## [2026-07-12]

### Added (backend hardening)

- Set `NOTIFY_EMAIL` on the interest-form Lambda and verified it in SES (confirmed via a
  real end-to-end test: submission landed in DynamoDB, no SES error in the logs).
- Submitted SES production-access request (currently sandboxed).
- CloudWatch log retention set to 90 days on the Lambda's log group (was unset/indefinite).
- DynamoDB point-in-time recovery enabled on `seads-interest-submissions`.
- API Gateway throttling (5 req/s, burst 10) on the interest-form endpoint.
- $30/month AWS Budget with 80%/100% actual and 100% forecasted spend alerts.

### Added

- Migrated hosting from Vercel to **AWS Amplify Hosting** (app `SeadsSingapore`,
  `d1s8x62kxpmlx7`, `us-east-1`), connected to `main` on GitHub with auto-deploy on push.
  Vercel is left running untouched as a fallback until a custom domain is confirmed working
  on Amplify.
- Built a real backend for the "Get Involved" form: API Gateway -> Lambda -> DynamoDB, with
  a best-effort SES notification email. This replaces the Google Sheets integration, which
  was never actually configured in production (see the 2026-07-11 entry — the form was
  silently discarding every submission). Source now lives in `backend/interest-form/`.
- Renamed `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT` to `NEXT_PUBLIC_INTEREST_FORM_ENDPOINT` to
  match (it was never Google Sheets in practice).

### Known Gaps

- SES is still in sandbox mode — request production access before relying on the
  notification email for real traffic.
- No custom domain yet; Amplify is serving from its default `*.amplifyapp.com` URL.
- No CI for the Lambda — deploys are manual (`backend/interest-form/README.md`).

## [2026-07-11]

### Fixed

- Mobile navigation permanently rendered the desktop layout (crammed nav overflowing
  horizontally, hamburger hidden) on every route for every mobile visitor. Root cause: a
  `useState` lazy initializer read `window.innerWidth`, which is unavailable during the
  static prerender, so the server always baked in the desktop layout — and React's
  hydration commit doesn't repaint markup it thinks already matches, so nothing ever
  corrected it afterward. Fixed by initializing at the SSR-safe default and correcting via
  `useLayoutEffect` post-mount (a genuine post-hydration render, which React does apply).
- The homepage "Get Involved" form silently told every visitor their submission was
  captured even when `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT` was unset (which it currently
  is) — nothing was actually being saved anywhere. Now shows an honest "not connected yet,
  email us directly" message instead.
- `events/page.tsx`: the "Join Our Events" button had no `onClick` handler at all.
- `contact/page.tsx`: the three email addresses were plain text, not clickable.

### Added

- Hover states across the site: cards, CTA buttons, nav/footer links, the locale switcher,
  theme toggle, and MediaMasonry's filter pills/gallery images/lightbox — previously there
  was no `hover:` styling anywhere despite `--brand-deep` being defined specifically for
  this purpose.
- Site-wide smooth scroll (respecting `prefers-reduced-motion`) and a consistent
  `:focus-visible` ring for keyboard navigation.
- `.env.example`, documenting the one environment variable this project actually uses
  (`docs/ENVIRONMENT.md` referenced a `.env.example` that didn't exist).

### Removed

- The Sanity CMS integration (`next-sanity`, `@sanity/client`, `groq`,
  `src/lib/sanity.ts`, `src/lib/queries.ts`). It was scaffolded early on but never
  actually imported by any route, and its dependency tree (a full copy of the Sanity
  Studio/CLI toolchain, including a bundled Vite dev server) accounted for 18 of this
  project's 23 `npm audit` findings. Removing it dropped that to 5, and a follow-up
  `npm audit fix` brought it to 3 — all three are inside Next.js's own bundled build-time
  PostCSS, not fixable without downgrading Next.js itself, and not exploitable here since
  no user input flows through it (see `docs/ARCHITECTURE.md`).

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
