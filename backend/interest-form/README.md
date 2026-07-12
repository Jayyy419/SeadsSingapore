# Interest form Lambda

Handles `POST /submit-interest` behind API Gateway. Validates the "Get Involved" form
payload, writes it to DynamoDB, and best-effort sends an SES notification email.

## Live resources (`us-east-1`, account `140023398409`)

- API Gateway: `seads-interest-form-api` (`h0bq61l33m`) — endpoint in `NEXT_PUBLIC_INTEREST_FORM_ENDPOINT`
- Lambda: `seads-interest-form-handler`
- DynamoDB table: `seads-interest-submissions`
- IAM role: `seads-interest-form-lambda-role` (scoped to just this table + SES + logs)

## Environment variables (set on the Lambda, not here)

- `TABLE_NAME` — DynamoDB table name
- `NOTIFY_EMAIL` — SES-verified address to send/receive submission notifications
- `ALLOWED_ORIGINS` — comma-separated list of allowed CORS origins (frontend URLs)

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
