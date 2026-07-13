# Environment Variables

Environment variables are documented in `.env.example`.

## Variables

### `NEXT_PUBLIC_INTEREST_FORM_ENDPOINT`

- API Gateway HTTP API URL that receives "Get Involved" interest-form submissions
  (name/email/interest) from `src/app/page.tsx`
- Backend: API Gateway (`seads-interest-form-api`) -> Lambda (`seads-interest-form-handler`)
  -> DynamoDB (`seads-interest-submissions`), with an SES notification email on success
- If unset, the form shows a "not connected yet" message and the submission is discarded
  — see the "Known Gaps" note below

### `NEXT_PUBLIC_SITE_URL`

- Canonical production URL (no trailing slash)
- Used by `src/app/sitemap.ts` and `src/app/robots.ts` to generate absolute URLs
- Falls back to the current Amplify `*.amplifyapp.com` URL if unset — update once a custom
  domain is live

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill required values
3. Restart dev server after changes

## Security Notes

- `NEXT_PUBLIC_*` vars are exposed to browser bundles
- Never place private tokens in `NEXT_PUBLIC_*` variables
- Store sensitive keys only in server-side environment variables

## Known Gaps

- None currently — SES production access was approved 2026-07-13, so the notification email
  is no longer sandbox-limited (see `docs/CHANGELOG.md`).

