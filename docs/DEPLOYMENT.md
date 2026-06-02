# Deployment Runbook

## Platform

- Vercel
- Current project: `spark-sg`

## One-Time Configuration

- Ensure `vercel.json` exists with:

```json
{
  "framework": "nextjs"
}
```

This enforces Next.js framework handling and prevents generic output misconfiguration.

## Deploy Steps (CLI)

From project root:

1. Install dependencies:
   - `npm install`
2. Optional local verification:
   - `npm run build`
3. Deploy production:
   - `vercel --prod --yes`

## Alias Management

To point the friendly alias:

- `vercel alias set <deployment-url> sparksg.vercel.app`

Example:

- `vercel alias set spark-xxxx-jayyy419-2398s-projects.vercel.app sparksg.vercel.app`

## Verification Checklist

1. Deployment status is `Ready` in Vercel dashboard/CLI
2. `curl -I https://<deployment-url>` returns `200` on `/`
3. `curl -I https://sparksg.vercel.app` returns `200`
4. Page renders expected homepage content

## Troubleshooting

### Symptom: `404 NOT_FOUND` on alias and deployment URL

Likely causes:

- Framework detection/output misconfiguration
- Alias pointing to stale or invalid deployment

Actions:

1. Confirm `vercel.json` framework is set to `nextjs`
2. Create fresh production deploy
3. Reassign alias to newest deployment
4. Re-test with `curl -I`

### Symptom: Alias shows old result in browser

Actions:

- Hard refresh browser
- Try incognito/private window
- Wait briefly for edge propagation
