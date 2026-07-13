# Deployment Runbook

## Platform

- **AWS Amplify Hosting** (`ap-southeast-1`, account `140023398409`)
- App: `SeadsSingapore` (App ID `d2mrph1bcp6pjx`)
- Branch: `main`, connected to `github.com/Jayyy419/SeadsSingapore`, auto-deploys on push
- Platform type: `WEB_COMPUTE` (Amplify's native Next.js App Router support — static and
  server-rendered routes both work without a manual build spec)
- Current URL: `https://main.d2mrph1bcp6pjx.amplifyapp.com` — update this and
  `NEXT_PUBLIC_SITE_URL` (`.env.example`, Amplify env vars) once a custom domain is attached

**Region:** moved from `us-east-1` to `ap-southeast-1` (Singapore) on 2026-07-13 — this
project's audience is Singapore/SEA-based, and while Amplify's static assets were already
edge-cached globally via CloudFront regardless of region, the interactive "Get Involved"
form's backend (API Gateway + Lambda + DynamoDB) benefits directly from sitting in-region
instead of round-tripping to `us-east-1`. SES moved too — verification and production access
are per-region and were redone from scratch in `ap-southeast-1` (see `docs/CHANGELOG.md`).
The old `us-east-1` stack (Amplify app, Lambda, API Gateway, DynamoDB table) was deleted
after the new region was verified working end-to-end.

**Legacy:** the site was previously also hosted on Vercel (project `spark-sg`, alias
`sparksg.vercel.app` / `seadssg.vercel.app`) as a fallback during the initial Amplify
migration. That deployment is not kept in sync with `main` and should be torn down once a
real domain is confirmed working on Amplify.

**PR previews:** enabled on `main` (`aws amplify update-branch --enable-pull-request-preview`)
— opening a PR against `main` builds a temporary preview deployment. Since this repo is
connected via a personal access token rather than the installed "AWS Amplify" GitHub App,
Amplify won't auto-comment the preview URL on the PR itself (that convenience feature needs
the GitHub App) — check the Amplify console for the preview branch's URL instead.

## One-Time Configuration

Already done for the current app/branch (documented here for setting up a new
app/environment, e.g. staging):

```bash
aws amplify create-app \
  --region ap-southeast-1 \
  --name "SeadsSingapore" \
  --repository "https://github.com/Jayyy419/SeadsSingapore" \
  --platform "WEB_COMPUTE" \
  --access-token "<github PAT with repo + webhook access; classic PAT with 'repo' scope is simplest>" \
  --enable-branch-auto-build \
  --environment-variables NEXT_PUBLIC_SITE_URL=<url>,NEXT_PUBLIC_INTEREST_FORM_ENDPOINT=<url>

aws amplify create-branch \
  --region ap-southeast-1 \
  --app-id <app-id> --branch-name main \
  --framework "Next.js - SSR" --stage PRODUCTION --enable-auto-build

aws amplify start-job --region ap-southeast-1 --app-id <app-id> --branch-name main --job-type RELEASE
```

Note: `create-app` only creates a webhook using the token at creation time — the token
itself isn't stored long-term by Amplify for ongoing deploys (pushes trigger via the
webhook), so the PAT doesn't need to stay valid after this one-time setup.

## Deploy Steps

Pushing to `main` on GitHub auto-deploys — no manual step needed for normal changes.

To trigger a rebuild without a new commit (e.g. after changing an env var):

```bash
aws amplify start-job --region ap-southeast-1 --app-id d2mrph1bcp6pjx --branch-name main --job-type RELEASE
```

## Verification Checklist

1. `aws amplify get-job --region ap-southeast-1 --app-id d2mrph1bcp6pjx --branch-name main --job-id <id>` shows
   `status: SUCCEED` for all of BUILD/DEPLOY/VERIFY
2. Visit the branch URL and confirm the page renders — light + dark theme, mobile view
   specifically (this app has previously shipped a mobile-only hydration bug that a
   build-success check alone wouldn't have caught)
3. Submit the "Get Involved" form and confirm the item lands in the
   `seads-interest-submissions` DynamoDB table

## Troubleshooting

### Build fails

```bash
aws amplify get-job --region ap-southeast-1 --app-id d2mrph1bcp6pjx --branch-name main --job-id <id> \
  --query 'job.steps[*].[stepName,status,logUrl]' --output table
```

Each `logUrl` is a short-lived presigned S3 link to that step's log.

### Custom domain

Not yet configured — do this once a domain is purchased:

```bash
aws amplify create-domain-association \
  --region ap-southeast-1 \
  --app-id d2mrph1bcp6pjx \
  --domain-name <domain> \
  --sub-domain-settings prefix=,branchName=main
```

Amplify provisions the ACM certificate and gives you DNS records to add (either at your
registrar, or via Route 53 if you move DNS there).

## Backend deployment

See `backend/interest-form/README.md` for the Lambda behind the interest form.
