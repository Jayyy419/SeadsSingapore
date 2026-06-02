# Environment Variables

Environment variables are documented in `.env.example`.

## Variables

### `NEXT_PUBLIC_SANITY_PROJECT_ID`

- Public Sanity project ID
- Used in `src/lib/sanity.ts`
- Required when fetching content from Sanity

### `NEXT_PUBLIC_SANITY_DATASET`

- Sanity dataset name
- Default expected value: `production`
- Used in `src/lib/sanity.ts`

### `SANITY_API_READ_TOKEN`

- Private token for authenticated read operations (if needed)
- Keep this secret
- Do not expose in client code

### `NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT`

- Public Google Apps Script Web App URL
- Used by homepage form submission logic in `src/app/page.tsx`
- If unset, form falls back to a no-endpoint success state in current implementation

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill required values
3. Restart dev server after changes

## Security Notes

- `NEXT_PUBLIC_*` vars are exposed to browser bundles
- Never place private tokens in `NEXT_PUBLIC_*` variables
- Store sensitive keys only in server-side environment variables
