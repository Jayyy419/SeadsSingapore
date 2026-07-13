# Interest form Lambda

Handles `POST /submit-interest` (and `GET /health`) behind API Gateway. Validates the "Get
Involved" form payload, writes it to DynamoDB, and best-effort sends an SES notification
email.

## Live resources (`ap-southeast-1`, account `140023398409`)

- API Gateway: `seads-interest-form-api` (`jztkgrm3lh`) — `POST /submit-interest` endpoint in
  `NEXT_PUBLIC_INTEREST_FORM_ENDPOINT`; `GET /health` returns `{"ok":true}` with no DB/SES
  calls, used only by the Route 53 health check
- Lambda: `seads-interest-form-handler`
- DynamoDB table: `seads-interest-submissions`
- IAM role: `seads-interest-form-lambda-role-sg` (`iam-policy.json` + `iam-trust-policy.json`
  in this directory — scoped to just this table + SES + logs + `seads/*` secrets)

## Monitoring

- CloudWatch alarms `seads-interest-form-lambda-errors` / `-throttles` (`ap-southeast-1`) on
  the Lambda's own `Errors`/`Throttles` metrics.
- Route 53 health checks `seads-api-health-check` (hits `GET /health`) and
  `seads-frontend-health-check` (hits the Amplify site's `/`), each with a CloudWatch alarm.
  Route 53 health-check metrics only publish to CloudWatch in `us-east-1` regardless of what
  region the checked endpoint is in, so those two alarms — and the SNS topic they notify —
  live in `us-east-1`, separate from the Lambda alarms' `ap-southeast-1` topic. Both topics
  are named `seads-alerts`; don't assume "the SNS topic" without checking the region.

Moved here from `us-east-1` on 2026-07-13 to sit closer to this project's Singapore/SEA
audience — the old stack was deleted after this one was verified working end-to-end.

## Environment variables (set on the Lambda, not here)

- `TABLE_NAME` — DynamoDB table name
- `NOTIFY_EMAIL` — SES-verified address to send/receive submission notifications
- `ALLOWED_ORIGINS` — comma-separated list of allowed CORS origins (frontend URLs)

## Secrets

- `seads/turnstile-secret-key` — Cloudflare Turnstile secret key, used to verify the
  `turnstileToken` field sent from the frontend against
  `https://challenges.cloudflare.com/turnstile/v0/siteverify` before writing anything to
  DynamoDB. Cached in-memory across warm invocations (`getTurnstileSecret()` in `index.mjs`).
  Fails *open* (allows the submission through) if the secret itself can't be loaded — a
  Secrets Manager or network blip shouldn't take the form down — but fails *closed* on an
  actual failed/missing verification, which is the case this exists to catch. The matching
  *site* key is public and lives in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (`.env.example`, Amplify
  env vars) — safe to expose client-side, unlike the secret key.

Adding another secret later is the same pattern — the execution role already has read access
to anything under the `seads/*` naming prefix, so no IAM change needed:

```bash
aws secretsmanager create-secret --name seads/some-api-key --secret-string "the-actual-value"
```

...and reading it in `index.mjs` with `@aws-sdk/client-secrets-manager`'s
`GetSecretValueCommand`.

## Updating the IAM policy

If the Lambda needs a new permission, edit `iam-policy.json` in this directory, then:

```bash
aws iam put-role-policy \
  --role-name seads-interest-form-lambda-role-sg \
  --policy-name seads-interest-form-exec-policy \
  --policy-document file://iam-policy.json
```

Keep the file in this repo as the source of truth — don't edit the policy directly in the
AWS console without updating this file to match.

## Deploying a change

Automatic: `.github/workflows/deploy-interest-form-lambda.yml` runs on every push to `main`
that touches `backend/interest-form/**`. It zips `index.mjs` + `node_modules` +
`package.json` and calls `lambda:UpdateFunctionCode`. No AWS secrets are stored in
GitHub — the workflow authenticates via OIDC (`aws-actions/configure-aws-credentials`),
assuming `seads-gha-lambda-deploy`, an IAM role that only trusts GitHub Actions tokens
issued for `repo:Jayyy419/SeadsSingapore:ref:refs/heads/main` (`gha-oidc-trust-policy.json`
in this directory) and can only call `lambda:UpdateFunctionCode` /
`lambda:GetFunction` / `lambda:GetFunctionConfiguration` on this one function
(`gha-deploy-policy.json`).

Manual fallback (e.g. testing a change before pushing):

```bash
cd backend/interest-form
npm ci --omit=dev
zip -qr function.zip index.mjs node_modules package.json
aws lambda update-function-code \
  --region ap-southeast-1 \
  --function-name seads-interest-form-handler \
  --zip-file fileb://function.zip
```

Requires AWS credentials with `lambda:UpdateFunctionCode` on this function.

## Setting up the OIDC role (already done, kept here for reference)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 1c58a3a8518e8759bf075b76b750d4f2df264fcd

aws iam create-role \
  --role-name seads-gha-lambda-deploy \
  --assume-role-policy-document file://gha-oidc-trust-policy.json

aws iam put-role-policy \
  --role-name seads-gha-lambda-deploy \
  --policy-name seads-gha-lambda-deploy-policy \
  --policy-document file://gha-deploy-policy.json
```
