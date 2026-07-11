# Environment Variables

Environment variables are documented in `.env.example`.

## Variables

### `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT`

- Public Google Apps Script Web App URL
- Used by the "Get Involved" interest-form submission logic in `src/app/page.tsx`
- If unset, the form still shows a success message but the submission is silently
  discarded — see the "Known Gaps" note below before going live

### `NEXT_PUBLIC_SITE_URL`

- Canonical production URL (no trailing slash), e.g. `https://seads.sg`
- Used by `src/app/sitemap.ts` and `src/app/robots.ts` to generate absolute URLs
- Falls back to the current `*.vercel.app` URL if unset — update once a custom domain is live

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill required values
3. Restart dev server after changes

## Security Notes

- `NEXT_PUBLIC_*` vars are exposed to browser bundles
- Never place private tokens in `NEXT_PUBLIC_*` variables
- Store sensitive keys only in server-side environment variables

## Known Gaps

- `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT` silently no-ops instead of erroring when unset.
  Before launch, either configure a real endpoint or change `onInterestSubmit` in
  `src/app/page.tsx` to surface a clear error/disabled state instead, so an unconfigured
  form doesn't quietly tell visitors their submission succeeded when it didn't.

