# Interest form Lambda

Handles `POST /submit-interest` behind API Gateway. Validates the "Get Involved" form
payload, writes it to DynamoDB, and best-effort sends an SES notification email.

## Live resources (`us-east-1`, account `140023398409`)

- API Gateway: `seads-interest-form-api` (`h0bq61l33m`) — endpoint in `NEXT_PUBLIC_INTEREST_FORM_ENDPOINT`
- Lambda: `seads-interest-form-handler`
- DynamoDB table: `seads-interest-submissions`
- IAM role: `seads-interest-form-lambda-role` (`iam-policy.json` + `iam-trust-policy.json`
  in this directory — scoped to just this table + SES + logs + `seads/*` secrets)

## Environment variables (set on the Lambda, not here)

- `TABLE_NAME` — DynamoDB table name
- `NOTIFY_EMAIL` — SES-verified address to send/receive submission notifications
- `ALLOWED_ORIGINS` — comma-separated list of allowed CORS origins (frontend URLs)

## Secrets

No real secret exists yet (this function only talks to DynamoDB/SES via its IAM role, no
third-party API keys). The execution role already has read access to anything under the
`seads/*` naming prefix in Secrets Manager, so adding one later is just:

```bash
aws secretsmanager create-secret --name seads/some-api-key --secret-string "the-actual-value"
```

...and reading it in `index.mjs` with `@aws-sdk/client-secrets-manager`'s
`GetSecretValueCommand` — no further IAM changes needed as long as the name starts with
`seads/`.

## Updating the IAM policy

If the Lambda needs a new permission, edit `iam-policy.json` in this directory, then:

```bash
aws iam put-role-policy \
  --role-name seads-interest-form-lambda-role \
  --policy-name seads-interest-form-exec-policy \
  --policy-document file://iam-policy.json
```

Keep the file in this repo as the source of truth — don't edit the policy directly in the
AWS console without updating this file to match.

## Deploying a change

There's no CI wired up for this yet — deploy manually:

```bash
cd backend/interest-form
npm ci --omit=dev
zip -qr function.zip index.mjs node_modules package.json
aws lambda update-function-code \
  --function-name seads-interest-form-handler \
  --zip-file fileb://function.zip
```

Requires AWS credentials for the `SeadsSingapore` IAM user (or equivalent) with
`lambda:UpdateFunctionCode` on this function.
