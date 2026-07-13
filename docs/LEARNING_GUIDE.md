# Learning Guide: How This Site Is Built

This is a teaching document, not a reference doc — `ARCHITECTURE.md`, `DEPLOYMENT.md`, etc.
tell you *what* exists tersely; this explains *why* and *how*, assuming much less prior
knowledge, using this project's actual code and commands as the examples throughout. It
gets added to every time we build something new — check the table of contents for what's
covered so far.

If a term is unfamiliar, check the Glossary at the bottom before searching elsewhere — it's
defined in the context of this project specifically.

## Table of Contents

1. [Part 1: The Website — Next.js, React, TypeScript, Tailwind](#part-1-the-website)
2. [Part 2: AWS Fundamentals](#part-2-aws-fundamentals)
3. [Part 3: How the AWS Backend Was Built, Step by Step](#part-3-how-the-aws-backend-was-built-step-by-step)
4. [Part 4: How the Frontend Deploys (Amplify)](#part-4-how-the-frontend-deploys-amplify)
5. [Part 5: Reading and Writing AWS CLI Commands](#part-5-reading-and-writing-aws-cli-commands)
6. [Part 6: Ops Hardening — What "Production Ready" Actually Meant Here](#part-6-ops-hardening)
7. [Part 7: CI/CD via OIDC, and Moving Regions](#part-7-cicd-via-oidc-and-moving-regions)
8. [Glossary](#glossary)

---

## Part 1: The Website

### What Next.js actually is

Next.js is a framework built on top of React. Plain React just gives you components; Next.js
adds **routing**, **build tooling**, and a **server** on top. The specific flavor this
project uses is called the **App Router** (as opposed to the older "Pages Router" — if you
see tutorials online using a `pages/` folder instead of `app/`, that's the old style, and
the syntax differs).

The core idea of the App Router: **folders are routes**. Look at `src/app/`:

```
src/app/
  page.tsx          -> the homepage, "/"
  about/page.tsx     -> "/about"
  programs/page.tsx  -> "/programs"
  layout.tsx          -> wraps every page (see below)
```

There's no router configuration file anywhere — the folder structure *is* the routing table.
Create `src/app/foo/page.tsx` and `/foo` exists as a route, automatically. This is why
`docs/ROUTES.md` can just list folder paths.

`layout.tsx` is special: it wraps every single page. Look at `src/app/layout.tsx` — it sets
up fonts, the `<html>`/`<body>` tags, loads global CSS, and injects the analytics script.
Every page's content gets inserted where `{children}` appears. You only have one root layout
here, but Next.js supports nested layouts too (a `layout.tsx` inside a subfolder would wrap
just that subtree) — this project doesn't use that.

### What a React component actually is

Strip away the JSX and a component is just a **function that returns a description of UI**.
Take `src/app/about/page.tsx`:

```tsx
export default function AboutPage() {
  return (
    <SiteShell title="About Seads" subtitle="...">
      <section>...</section>
    </SiteShell>
  );
}
```

`AboutPage` is a plain JavaScript function. The `<SiteShell>...</SiteShell>` syntax is
**JSX** — it looks like HTML but it's not; it's syntactic sugar that compiles to
`React.createElement(SiteShell, {...}, ...)` calls. You're not writing HTML, you're
describing a tree of function calls that happens to look like HTML because that's easier to
read. `export default` means "when something imports this file, this function is what they
get" — that's how `src/app/about/page.tsx` being a route works: Next.js imports the default
export and renders it for `/about`.

Components can take **props** (parameters, effectively). `SiteShell` is defined in
`src/components/site-shell.tsx`:

```tsx
type SiteShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function SiteShell({ children, title, subtitle }: SiteShellProps) {
```

`{ children, title, subtitle }` is destructuring — same as pulling three named values out of
an object. `children` is special in React: whatever you put *between* `<SiteShell>` and
`</SiteShell>` when using the component gets passed in automatically as the `children` prop.
`title?` with a question mark means "optional" in TypeScript — the component works fine if
you don't pass one (see the `{title && (...)}` conditional rendering inside — "if title is
truthy, render this block, otherwise render nothing").

### Server components vs. Client components — the single most important Next.js concept

Every component in the App Router is a **Server Component by default**. That means it only
ever runs on the server (or at build time), never ships any JavaScript to the browser for
that component, and *cannot* use things like `useState`, `onClick`, or anything that only
makes sense in a live browser.

`src/app/page.tsx` (the homepage) starts with:

```tsx
"use client";
```

That one line changes everything about the file: it and everything it imports gets bundled
into JavaScript that ships to the browser and re-runs there, so it can hold live state
(`useState`), respond to clicks, use `useEffect`, etc. `src/components/site-header.tsx` also
starts with `"use client"` for the same reason — it needs `useState` for the mobile menu,
theme, locale, and the hover-driven flower bloom.

Compare that to `src/app/about/page.tsx` — no `"use client"` at the top. It's a Server
Component. That's *why* it's allowed to `export const metadata = {...}` (see below) — that
export only works in Server Components, since metadata generation happens at build/request
time, not in the browser.

**Rule of thumb used throughout this codebase:** if a component needs interactivity
(clicking, hovering with state, `useEffect`), it needs `"use client"`. If it's just rendering
static content, leave it as a Server Component — it's simpler and ships less JavaScript.

### Metadata (SEO) exports

Every subpage (`src/app/about/page.tsx`, `src/app/programs/page.tsx`, etc.) has this near the
top:

```tsx
export const metadata: Metadata = {
  title: "About",
  description: "Seads is a youth-led non-profit...",
};
```

Next.js looks for this exact export name (`metadata`) and, if found, uses it to generate the
page's `<title>` tag and `<meta name="description">` tag — the stuff search engines and
browser tabs show. The root layout sets `title: { template: "%s | Seads Singapore" }`, so a
subpage's `title: "About"` actually renders as `About | Seads Singapore` in the browser tab —
the `%s` gets substituted. This only works because these files are Server Components; the
homepage can't do this (it's `"use client"`), so it just inherits the root layout's default
title/description.

### TypeScript, briefly

TypeScript is JavaScript with type annotations checked before the code ever runs. You'll see
patterns like:

```tsx
const [locale, setLocale] = useState<Locale>("en");
```

`useState<Locale>` tells TypeScript "this state variable can only ever be one of the values
defined by the `Locale` type" (which is `"en" | "zh" | "ms" | "hi"`, defined in
`src/content/i18n.ts`). If you tried `setLocale("fr")` anywhere, TypeScript would refuse to
compile — that's the whole point, catching mistakes before they ship. Run `npx tsc --noEmit`
any time to check the whole project for type errors without actually building anything (this
is run before every commit in this project's workflow).

### Tailwind CSS

Instead of writing custom CSS classes, Tailwind gives you small utility classes you compose
directly in `className`:

```tsx
className="rounded-full bg-[color:var(--brand)] px-6.5 py-3.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
```

Reading this left to right: fully rounded corners, background color set to the `--brand` CSS
variable, horizontal padding of 6.5 (Tailwind's spacing scale, roughly `6.5 * 0.25rem =
1.625rem`), vertical padding 3.5, small text, semibold weight, white text, and on hover,
background changes to `--brand-deep`. The `bg-[color:var(--brand)]` syntax with square
brackets is an "arbitrary value" — normally Tailwind only knows about a fixed palette of
colors, but square brackets let you drop in any raw CSS value, which is how this project
plugs in its own custom color system (see next section) instead of Tailwind's defaults.

**Why `hover:` needed a real fix, not just adding the class:** early in this project, some
buttons set their color via inline `style={{ background: someValue }}` instead of a Tailwind
class. Inline `style` attributes always win over CSS classes, *including* `:hover` states —
so `hover:bg-[color:...]` on an element that also had `style={{background: ...}}` silently
did nothing. Fixed by only setting the inline style for the state that actually needs a
dynamic value (the *active* locale button) and leaving it `undefined` otherwise, letting the
Tailwind hover class take over for the inactive state. See `src/components/site-header.tsx`,
`locales` array construction, for the actual fix.

### The theming system (CSS variables)

`src/app/globals.css` defines custom properties like `--brand`, `--foreground`, `--surface`:

```css
:root {
  --brand: #2f6f5e;
  --foreground: #1f2937;
}

:root[data-theme="dark"] {
  --brand: #6fc0a4;
  --foreground: #eef1ec;
}
```

Every component reads colors via `var(--brand)` instead of hardcoding hex values. Dark mode
works by literally swapping which block of variables is active — `SiteHeader`'s theme toggle
just does `document.documentElement.setAttribute("data-theme", "dark")`, and every `var(--x)`
reference across the entire site updates instantly, no React re-render needed for the colors
themselves (only for things like the sun/moon icon glyph, which is actual rendered text, not
CSS).

**Gotcha we hit:** a couple of sections (About/etymology strip, Get Involved) are supposed to
*always* look dark regardless of site theme — they used `var(--foreground)` for their
background, but `--foreground` is the *text* color, which deliberately flips between themes
(dark text in light mode, light text in dark mode). So in dark mode, those "always dark"
sections turned nearly white with washed-out text. Fix: added dedicated `--inverse-bg` /
`--inverse-fg` tokens that don't flip the same way `--foreground` does, and switched those
specific sections to use them.

### Hooks used in this codebase (`useState`, `useEffect`, `useLayoutEffect`, `useRef`)

- **`useState`**: holds a value that, when changed via its setter function, causes the
  component to re-render with the new value. `const [isOpen, setIsOpen] = useState(false)`.
- **`useEffect`**: runs code *after* the component renders and commits to the DOM — the right
  place for anything that talks to the outside world (event listeners, timers, `fetch`
  calls). Runs again whenever anything in its dependency array (`[...]` at the end) changes;
  an empty array `[]` means "only run once, after the first render."
- **`useLayoutEffect`**: same as `useEffect`, but runs *synchronously before the browser
  paints* the frame, instead of asynchronously after. Used once in this codebase, in
  `SiteHeader`, and the reason why matters — see the mobile-nav bug writeup below.
- **`useRef`**: holds a mutable value that *doesn't* trigger a re-render when changed, and/or
  a reference to an actual DOM element (`<div ref={myRef}>`). Used throughout `SiteHeader` to
  measure the width of the vine SVG and to track nav button positions for the sprig
  animation.

### A real bug, explained end to end: why mobile nav broke for every visitor

This is worth understanding in depth because it's a genuinely subtle interaction between
three concepts above (Server Components, `useState` initializers, and hydration).

The original code:

```tsx
const [isMobile, setIsMobile] = useState(
  () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
);
```

This looks reasonable: on the server, `window` doesn't exist (there's no browser on a
server), so it evaluates to `false`. On the client (in a real browser), `window.innerWidth`
is available, so on a phone it'd correctly evaluate to `true`.

Here's the part that isn't obvious: this site is **statically prerendered** — the HTML is
generated *once*, at build time, on a build server with no `window`, and that exact same
HTML file is shipped to every visitor regardless of their device. So the *shipped HTML*
always has the desktop layout baked in (`isMobile` was `false` when the HTML was generated).

When a real visitor's browser loads that HTML, React "hydrates" it — attaches event handlers
and takes over rendering, ideally without needing to touch the DOM at all if the browser's
own calculation matches what's already there. The React state internally *did* correctly
compute `isMobile = true` on a phone. But React's hydration step specifically **does not
repaint DOM attributes it believes should already match** — it trusts the server's markup on
that very first commit. Since nothing else ever caused that component to re-render
afterward, the DOM's `className` (`"flex"`, the desktop layout) never actually got updated to
match React's internal `"hidden"` decision. Permanently broken, for every mobile visitor, on
every route, and it wouldn't show up in any error log — no exception was thrown, the wrong
value just silently stuck.

The fix: don't try to compute the "real" value inside `useState`'s initializer at all.
Initialize at the safe default (matching what the server rendered), then explicitly correct
it in an effect:

```tsx
const [isMobile, setIsMobile] = useState(false); // matches server-rendered default

useLayoutEffect(() => {
  const mobile = window.innerWidth < MOBILE_BREAKPOINT;
  setIsMobile(mobile); // a REAL state update, not part of the hydration commit
}, []);
```

A `setState` call inside an effect *is* a genuine, separate render pass — hydration has
already finished by the time an effect runs, so React freely repaints the DOM to match.
`useLayoutEffect` instead of `useEffect` was chosen specifically so this correction happens
before the browser paints the first frame — with plain `useEffect` there'd be a visible
flash of the wrong layout for a frame or two before it corrected itself.

---

## Part 2: AWS Fundamentals

Every AWS service is really just an API — the console (the website you'd click around in) is
one client of that API, and the CLI (`aws ...` commands) is another. Everything shown below
as a CLI command has an equivalent set of clicks in the console, and vice versa.

### IAM — who's allowed to do what

**IAM (Identity and Access Management)** controls authentication (who are you?) and
authorization (what are you allowed to do?) for everything else in AWS.

- A **user** (e.g., `SeadsSingapore`, the IAM user whose keys you've been giving me) is an
  identity with long-lived credentials (an access key + secret key).
- A **role** (e.g., `seads-interest-form-lambda-role`) is an identity *without* long-lived
  credentials — instead, something else (a person, or an AWS service like Lambda) temporarily
  "assumes" the role to borrow its permissions for a while. Lambda functions always run *as*
  a role, never as a user with hardcoded keys sitting in the function's code — that's exactly
  why the Lambda's code never contains any AWS credentials at all, and still successfully
  writes to DynamoDB (see Part 3).
- A **policy** is a JSON document listing exactly what actions are allowed on what resources.
  Two kinds got used here:
  - A **trust policy** (`backend/interest-form/iam-trust-policy.json`) says *who's allowed to
    assume this role*. Ours says "the Lambda service is allowed":
    ```json
    { "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }
    ```
  - A **permissions policy** (`backend/interest-form/iam-policy.json`) says *what the role can
    actually do once assumed* — see the full breakdown in Part 3.

**The `AdministratorAccess` situation, explained:** the `SeadsSingapore` IAM *user*
(long-lived keys, used to provision everything from this CLI) currently has the
`AdministratorAccess` managed policy attached — full permissions on the whole account. That's
what let me create all these resources in one session. It is **not** the same as the Lambda's
*role*, which has a narrow, purpose-built policy (exactly `dynamodb:PutItem` on one table,
`ses:SendEmail`, log writes, and now `secretsmanager:GetSecretValue` scoped to a naming
prefix) — so even though the *provisioning* credential was maximally powerful, the *running
application* only has the minimum it actually needs. This distinction — broad access for
setup, narrow access for the thing that actually runs continuously and is reachable from the
internet — is the core idea behind "least privilege."

### Lambda — code that runs without a server to manage

A **Lambda function** is a piece of code AWS runs for you on demand — you're not renting a
server that sits idle waiting for requests; AWS spins up an execution environment only when
something actually invokes the function, and you're billed per invocation + execution time
(rounded to the millisecond), not for idle time. `seads-interest-form-handler` runs Node.js
20.x, and its entire job is defined in `backend/interest-form/index.mjs`'s exported `handler`
function — API Gateway calls that function with details about the incoming HTTP request, and
whatever the function returns becomes the HTTP response.

### DynamoDB — a NoSQL key-value database

Unlike a traditional SQL database (rows/columns/schemas enforced upfront), DynamoDB stores
"items" (roughly: JSON objects) identified by a **partition key**. Our table
`seads-interest-submissions` uses `id` (a randomly generated UUID per submission) as that
key. There's no schema to alter if you want to add a new field later — just start writing
items that include it. Billing mode `PAY_PER_REQUEST` (a.k.a. "on-demand") means you pay per
read/write, with no capacity to provision or guess at ahead of time — the right choice for
unpredictable, low-volume traffic like a contact form, versus "provisioned" capacity, which
is cheaper only if you have a steady, predictable, and *large* amount of traffic.

### API Gateway — turning HTTP requests into Lambda invocations

Lambda functions don't have a URL by default — **API Gateway** is what gives them one. We
used the newer, cheaper "HTTP API" type (as opposed to the older, more feature-heavy "REST
API" type) since we just need a single POST route with CORS, nothing fancier. The
`create-api --target <lambda-arn>` "quick create" flow automatically wires up the route and
integration, but — this tripped us up — it does *not* automatically grant the Lambda
permission to be invoked by API Gateway; that's a separate explicit step
(`aws lambda add-permission`), since Lambda's own resource policy needs to name exactly which
API is allowed to call it.

### SES — sending email

**SES (Simple Email Service)** sends transactional email from your own domain/address rather
than routing through a third-party email API. New accounts start in **sandbox mode**: you can
only send to (and from) addresses/domains you've explicitly verified, and there's a low daily
send cap (200/day here). This is an anti-abuse measure — production access requires
submitting a short description of your use case for AWS to review
(`aws sesv2 put-account-details`), which we did; it's a review process, not instant.

### Amplify Hosting — deploying the frontend

**Amplify Hosting** connects to a Git repository and builds/deploys on every push, similar to
what Vercel/Netlify do. We used platform type `WEB_COMPUTE`, which is Amplify's mode that
understands Next.js's App Router build output natively (both the static pages and any
server-rendered ones, though this site happens to be 100% static). Under the hood, it's
serving your build through CloudFront (AWS's CDN) — that's what makes it fast globally
without you managing any of that infrastructure.

### CloudWatch — logs and monitoring

Every Lambda invocation automatically writes its `console.log`/`console.error` output to a
**CloudWatch Logs** log group (`/aws/lambda/<function-name>`). By default these logs are kept
forever, which slowly costs money for no benefit on an old, never-read log line — we set a
90-day retention policy so old logs auto-delete.

### Secrets Manager vs. Parameter Store vs. plain environment variables

Three places to put configuration, in order of "how sensitive is this":

- **Plain Lambda environment variables** (what `TABLE_NAME`, `NOTIFY_EMAIL`, and
  `ALLOWED_ORIGINS` are) — fine for values that aren't actually secret (a table name isn't
  sensitive), simple, no extra API calls needed to read them.
- **Systems Manager Parameter Store** — for configuration you want centralized/versioned/
  shared across multiple functions, but still not truly secret.
- **Secrets Manager** — for actual credentials (API keys, database passwords, tokens):
  encrypted at rest, supports automatic rotation, and access is logged. Costs about
  $0.40/month per secret, which is why we didn't create an empty one just to have it — we
  instead just pre-granted the IAM permission (`secretsmanager:GetSecretValue` scoped to a
  `seads/*` naming prefix) so adding a real secret later needs zero further IAM changes; see
  `backend/interest-form/README.md`'s "Secrets" section for the exact command to add one when
  needed.

---

## Part 3: How the AWS Backend Was Built, Step by Step

This walks through the actual commands used to build the interest-form backend, in the order
they ran, with each flag explained. All of this used the AWS CLI directly (no console
clicking) — every command below is real, taken from this session.

### Step 1: the database

```bash
aws dynamodb create-table \
  --table-name seads-interest-submissions \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

- `--attribute-definitions AttributeName=id,AttributeType=S` declares that there's an
  attribute named `id` of type `S` (string) — DynamoDB only needs you to declare the
  attribute(s) used as keys upfront, not the whole schema.
- `--key-schema AttributeName=id,KeyType=HASH` says `id` is the partition key (`HASH` is
  DynamoDB's internal name for a partition key, for historical reasons — it literally hashes
  the key to decide which internal storage partition an item lives on).
- Table creation is asynchronous — right after this call, the table exists but isn't ready to
  use yet. `aws dynamodb wait table-exists` polls until it's genuinely usable, which is why
  that command appears right after in the session.

### Step 2: the IAM role Lambda will run as

```bash
aws iam create-role \
  --role-name seads-interest-form-lambda-role \
  --assume-role-policy-document file://trust-policy.json
```

`--assume-role-policy-document` is the *trust* policy (who can assume this role — see Part
2). Creating a role doesn't grant it any permissions yet, just establishes its identity and
who's allowed to use it. Permissions are attached separately:

```bash
aws iam put-role-policy \
  --role-name seads-interest-form-lambda-role \
  --policy-name seads-interest-form-exec-policy \
  --policy-document file://iam-policy.json
```

`put-role-policy` attaches an **inline policy** (lives only on this role, deleted if the role
is deleted) as opposed to `attach-role-policy`, which attaches a reusable **managed policy**
(like the `AdministratorAccess` one on the `SeadsSingapore` user) that could be shared across
many roles. Inline was the right choice here since this policy is purpose-built for exactly
one function and nothing else should ever share it.

### Step 3: the function code

The handler (`backend/interest-form/index.mjs`) does five things, in order:

1. **CORS/preflight handling** — browsers send an `OPTIONS` request before a "real" POST from
   JavaScript to a different origin, to ask permission first. `if (... === "OPTIONS") return
   { statusCode: 204, headers, body: "" }` answers that preflight check.
2. **Parse and validate** the JSON body — `JSON.parse(event.body)`, wrapped in `try/catch`
   since a malformed request could crash the function otherwise. Checks `name` is non-empty
   and `email` looks like an email via a regex.
3. **Write to DynamoDB** via `PutCommand` — this is the AWS SDK's typed wrapper around a raw
   `PutItem` API call.
4. **Best-effort email** via SES's `SendEmailCommand`, wrapped in its own `try/catch` that
   only logs on failure rather than throwing — deliberate: if DynamoDB write succeeded but
   the email fails (e.g., address not yet SES-verified, which is exactly what happened before
   we verified `opsfin.sg@aseanyouthadvocates.org`), the submission is still safely saved; we
   don't want a flaky email step to make the whole request look like it failed when the
   important part (not losing the visitor's data) already succeeded.
5. **Return a response** with CORS headers so the browser's JavaScript is actually allowed to
   read the result.

Deploying code to Lambda is a zip file upload, not a git push:

```bash
npm install --omit=dev          # get the AWS SDK packages, skip devDependencies
zip -qr function.zip index.mjs node_modules package.json
aws lambda create-function \
  --function-name seads-interest-form-handler \
  --runtime nodejs20.x \
  --role arn:aws:iam::140023398409:role/seads-interest-form-lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip
```

- `--handler index.handler` tells Lambda "in the file `index.mjs`, call the export named
  `handler`" when invoked — matches `export const handler = async (event) => {...}` in the
  code.
- `--zip-file fileb://function.zip` — the `fileb://` prefix (vs. `file://`) tells the CLI
  "this is binary data, read it as raw bytes," which matters for a zip file.
- We bundled `node_modules` into the zip rather than relying on Lambda's runtime having the
  AWS SDK pre-installed — the Node.js Lambda runtime *does* include some AWS SDK v3 packages
  built in, but not a guaranteed/versioned set across all the specific packages we needed
  (`@aws-sdk/lib-dynamodb`, `@aws-sdk/client-ses`), so bundling explicitly avoids a
  "module not found" surprise at runtime that local testing wouldn't have caught.

### Step 4: exposing it over HTTP

```bash
aws apigatewayv2 create-api \
  --name seads-interest-form-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:...:function:seads-interest-form-handler \
  --route-key "POST /submit-interest" \
  --cors-configuration AllowOrigins=...,AllowMethods=POST,OPTIONS,AllowHeaders=content-type
```

`--target` + `--route-key` together are a "quick create" shortcut that sets up the route and
Lambda integration in one call, instead of separately calling `create-integration` then
`create-route`. What it does *not* do automatically — and what we had to add as a second
step — is grant Lambda's own resource policy permission to be invoked by this specific API:

```bash
aws lambda add-permission \
  --function-name seads-interest-form-handler \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:...:h0bq61l33m/*/*/submit-interest"
```

This is a *second, independent* permission check from the IAM role's own policy — think of
it as "does API Gateway have permission to knock on this Lambda's door" (this
`add-permission` call), separate from "once inside, what can the Lambda's own role do" (the
`put-role-policy` call from Step 2). Both have to say yes.

### Step 5: verifying end to end

Every piece of new infrastructure in this project got tested with a real request before being
considered done, not just trusted because the AWS CLI didn't error:

```bash
curl -X POST "https://h0bq61l33m.execute-api.us-east-1.amazonaws.com/submit-interest" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","interest":"Testing"}'
# -> {"ok":true}

aws dynamodb scan --table-name seads-interest-submissions --query 'Items'
# -> confirms the item actually landed, not just that the API returned 200
```

Then the test item gets deleted (`aws dynamodb delete-item`) so it doesn't pollute real data.

---

## Part 4: How the Frontend Deploys (Amplify)

```bash
aws amplify create-app \
  --name "SeadsSingapore" \
  --repository "https://github.com/Jayyy419/SeadsSingapore" \
  --platform "WEB_COMPUTE" \
  --access-token "<a GitHub PAT>" \
  --enable-branch-auto-build
```

The `--access-token` is only needed at this one-time setup step — Amplify uses it once to
create a **webhook** on the GitHub repo (a callback URL GitHub pings whenever you push), and
after that, ongoing deploys are triggered by the webhook firing, not by Amplify continuing to
hold onto that token for repeated API calls.

```bash
aws amplify create-branch --app-id <id> --branch-name main --framework "Next.js - SSR" --stage PRODUCTION
aws amplify start-job --app-id <id> --branch-name main --job-type RELEASE
```

`create-branch` registers which Git branch maps to this Amplify "branch" (Amplify's own
concept of an environment — one per Git branch, each gets its own URL). `start-job` triggers
the *first* build manually — after that, every `git push` to `main` triggers a new one
automatically via the webhook, which is exactly what happened when we pushed the backend
integration commit and a fresh build kicked off without us calling `start-job` again.

A build has three phases, all of which have to succeed:

```bash
aws amplify get-job --app-id <id> --branch-name main --job-id <id> \
  --query 'job.steps[*].[stepName,status]'
# BUILD -> compiles the Next.js app (npm install + npm run build, roughly)
# DEPLOY -> uploads the build output to Amplify's hosting infrastructure
# VERIFY -> Amplify's own smoke test that the deployed app actually responds
```

---

## Part 5: Reading and Writing AWS CLI Commands

Every AWS CLI command follows the same shape:

```
aws <service> <action> [--parameter value ...]
```

- `<service>` is which AWS product (`dynamodb`, `lambda`, `iam`, `s3`, `ses`, `sesv2`,
  `apigatewayv2`, `amplify`, `budgets`, `logs`, `sts`...). Note `ses` vs `sesv2` — some
  services have two CLI namespaces because AWS shipped a newer API version without fully
  replacing the old one; `sesv2` is the modern one, used here for
  `get-account`/`put-account-details`, but plain `ses` still works fine for
  `verify-email-identity` (both talk to the same underlying service).
- `<action>` is almost always a verb-noun pair matching the underlying API operation exactly
  (`create-table`, `get-caller-identity`, `put-role-policy`).

Useful flags that work on *any* command:

- `--generate-cli-skeleton` — prints every possible parameter for that action as an empty
  JSON template, without actually running anything. Used repeatedly in this project to find
  the right parameter names without guessing (e.g., discovering `create-app` needs
  `platform: WEB_COMPUTE` rather than something else, by looking at the skeleton first).
- `--query` — filters the JSON response using **JMESPath** syntax (a query language for
  JSON), so you only see the field you actually care about instead of the full response
  blob. `--query 'app.environmentVariables'` pulls just that nested field.
- `--output text` / `--output table` — changes the response format from the default JSON to
  something more readable for a quick check.
- `export AWS_PAGER=""` — by default the CLI pipes long output through a pager (like `less`),
  which doesn't play well with a non-interactive session; disabling it makes output print
  directly.

**On credentials:** every command in this session set `AWS_ACCESS_KEY_ID` and
`AWS_SECRET_ACCESS_KEY` as environment variables immediately before running, rather than
writing them into a persistent config file (`~/.aws/credentials`). That's a deliberate
choice — env vars only exist for that one command's process and are never written to disk
anywhere in this environment, so there's nothing left behind to accidentally leak later.

---

## Part 6: Ops Hardening

A handful of small, unglamorous changes that matter far more for "is this production-ready"
than any feature does:

- **Least-privilege IAM** (Part 2/3) — the difference between a role that can do exactly one
  thing and a credential that can do everything.
- **CloudWatch log retention** (`aws logs put-retention-policy --retention-in-days 90`) — logs
  default to *never* expiring, which is a slow, silent, indefinite cost for data nobody will
  ever look at again after a few weeks.
- **DynamoDB point-in-time recovery** (`aws dynamodb update-continuous-backups
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true`) — lets you restore
  the table to any point in the last 35 days if something (a bug, a mistake, an attacker)
  corrupts or deletes data. Off by default; costs a small percentage of your storage cost to
  enable.
- **API Gateway throttling** (`ThrottlingRateLimit=5, ThrottlingBurstLimit=10`) — this
  endpoint has no authentication (anyone can hit it, by design — it's a public form), so
  without a rate limit, someone could script thousands of fake submissions per second,
  running up your Lambda/DynamoDB/SES bill and flooding the notification inbox. A real
  visitor filling out a form will never come close to 5 requests per second.
- **A billing budget** (`aws budgets create-budget`) — an email alert if spend crosses 80% or
  100% of a threshold, or is forecasted to. The only real protection against "I got a
  surprise bill" for a small project like this.
- **Documenting infrastructure in git**, not just the AWS console — `backend/interest-form/`
  holds the actual Lambda source and both IAM policy JSON files as the source of truth, so a
  console edit that isn't reflected back into these files is itself a bug to fix, not a
  normal way of working.

---

## Part 7: CI/CD via OIDC, and Moving Regions

### Why OIDC instead of just pasting an AWS key into GitHub

GitHub Actions needs *some* AWS credential to deploy the Lambda. The naive way is: create an
IAM user, generate an access key, paste it into a GitHub repo secret. That works, but that key
is now a second, permanent, easy-to-forget credential sitting in a system outside AWS — if
GitHub is ever compromised, or the secret is accidentally logged, that key keeps working until
someone remembers to rotate it.

**OIDC (OpenID Connect)** avoids this entirely. GitHub's Actions runners can present a signed,
short-lived identity token proving "this workflow run is really `main` on
`Jayyy419/SeadsSingapore`." AWS has a built-in trust relationship for this
(`token.actions.githubusercontent.com`), so an IAM role can say "I'll hand out temporary
credentials to anyone who shows up with a valid GitHub token for *this specific repo and
branch*" — no long-lived secret anywhere. The setup was two pieces:

```bash
# 1. Tell AWS to trust GitHub's OIDC tokens at all (done once per AWS account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 1c58a3a8518e8759bf075b76b750d4f2df264fcd

# 2. Create a role that trusts tokens *only* from this repo's main branch
aws iam create-role \
  --role-name seads-gha-lambda-deploy \
  --assume-role-policy-document file://gha-oidc-trust-policy.json
```

The trust policy's `Condition` block is what actually does the scoping:

```json
"StringLike": {
  "token.actions.githubusercontent.com:sub": "repo:Jayyy419/SeadsSingapore:ref:refs/heads/main"
}
```

Without this, *any* GitHub Actions workflow anywhere could try to assume the role (the OIDC
provider itself just says "trust GitHub," not "trust this repo"). The permissions policy on
top is scoped further still — just `lambda:UpdateFunctionCode` on one function ARN, nothing
else. In the workflow YAML, this is one step:

```yaml
permissions:
  id-token: write   # lets this workflow request an OIDC token at all
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::140023398409:role/seads-gha-lambda-deploy
      aws-region: ap-southeast-1
```

That action exchanges the GitHub token for temporary AWS credentials (valid ~1 hour), which
every later `aws` CLI call in the job then uses automatically.

### GitHub token permission gotchas hit along the way

Two real failures worth remembering, because the error messages are non-obvious:

- **Fine-grained PAT missing "Webhooks" permission**: Amplify's `create-app` needs to register
  a webhook on the GitHub repo so pushes trigger builds. A token without repo-level
  **Webhooks: Read and write** fails with `Resource not accessible by personal access token`
  — easy to misread as an Amplify problem when it's actually a token scope problem.
- **Token missing the `workflow` scope**: GitHub specifically blocks pushes that touch
  `.github/workflows/*.yml` unless the token has the `workflow` scope (classic PATs) or
  **Contents: Read and write** + **Workflows: Read and write** (fine-grained PATs) — even if
  the same token can push to every other file in the repo. This is deliberate: it stops a
  leaked lower-privilege token from silently rewriting CI. `git push` fails with `refusing to
  allow a Personal Access Token to create or update workflow ... without workflow scope`.

### Moving the backend from us-east-1 to ap-southeast-1

This project's users are in Singapore/SEA, so having the *interactive* part of the backend
sit in `us-east-1` (Virginia) meant every "Get Involved" form submission paid a real
trans-Pacific round trip (~200ms+) before the visitor saw a response. Worth being precise
about what actually needed to move, though — **not everything benefits equally**:

- **Amplify's static/prerendered pages don't care about region** the way you'd expect. Amplify
  Hosting serves through CloudFront, a global CDN with edge locations already in Singapore —
  so page loads were already fast for SEA visitors regardless of which region the Amplify
  "app" resource lived in. Moving Amplify's home region doesn't change where the HTML/JS/CSS
  is served *from* on a page load; it only changes where the build itself runs and where the
  API control-plane calls land.
- **API Gateway (HTTP API type) has no edge network** — every request goes straight to the
  regional endpoint. This is the part that actually got slower for SEA visitors sitting in
  `us-east-1`, and the part that got genuinely faster after the move.
- **SES verification and production-access approval are per-region.** Being approved for
  production sending in `us-east-1` counted for nothing in `ap-southeast-1` — the identity had
  to be re-verified (a fresh confirmation email, even for the same address) and production
  access re-requested from scratch. (In this case AWS auto-approved the second region
  instantly, likely because the account already had a clean sending history from the first
  region — but that's not guaranteed, so budget time for a manual review when doing this.)
- **IAM roles are account-wide, not regional** — so the new Lambda's execution role needed a
  *different name* (`seads-interest-form-lambda-role-sg`) since the old role
  (`seads-interest-form-lambda-role`) still existed in the other region during the transition.
  Lambda functions, API Gateway APIs, DynamoDB tables, and Amplify apps, by contrast, *are*
  regional resources, so those could all keep their exact same names in the new region without
  any conflict.

The migration order matters for safety: build the entire new stack first (DynamoDB → IAM role
→ Lambda → API Gateway → SES → Amplify), test it end-to-end with a real POST request and a
DynamoDB read, confirm the Amplify build succeeds and the site renders, *then* delete the old
region's resources. Doing it in the opposite order (delete first, then rebuild) would mean
real downtime if anything in the rebuild went wrong.

### A permission mistake worth learning from

When the scoped IAM policy for this work was drafted, it included `iam:CreateRole` /
`PutRolePolicy` / `AttachRolePolicy` / `GetRole` / `PassRole` (needed to create the new
region's execution role) but not `iam:DeleteRole` / `DeleteRolePolicy` — so cleaning up the
*old* region's now-orphaned role hit an `AccessDenied` error partway through the cleanup.
This is a normal, low-stakes example of why least-privilege policies are iterative: you scope
tightly for what you know you need, and expand deliberately (one narrow action at a time, to
the same tightly-scoped resource pattern) when a real gap shows up — rather than reaching for
a broad policy "just in case" up front.

---

## Glossary

- **App Router**: Next.js's routing system where folders under `src/app/` map directly to
  URL paths.
- **ARN**: Amazon Resource Name — AWS's globally unique identifier format for any resource,
  e.g. `arn:aws:lambda:us-east-1:140023398409:function:seads-interest-form-handler`.
- **CORS**: Cross-Origin Resource Sharing — the browser security rule that blocks JavaScript
  on one domain from calling an API on another domain unless that API explicitly allows it.
- **Hydration**: the process of React "waking up" static server-rendered HTML in the browser
  — attaching event handlers and reconciling its own understanding of the UI with what's
  already in the DOM.
- **IAM role vs. user**: a user has long-lived credentials you hand out; a role has no
  credentials of its own and is temporarily "assumed" by something else.
- **JMESPath**: the query language used by `--query` on AWS CLI commands to filter JSON
  responses.
- **JSX**: the HTML-like syntax used inside React components; compiles to plain JavaScript
  function calls.
- **Lambda**: AWS's serverless compute service — you provide code, AWS runs it on demand
  without you managing a server.
- **Least privilege**: giving an identity (user or role) only the exact permissions it needs,
  nothing more.
- **Partition key**: the field DynamoDB uses to decide which internal storage partition an
  item lives on; effectively the "primary key" for lookups.
- **SES sandbox mode**: the restricted default state of a new SES account (verified addresses
  only, low send quota) until AWS approves a production-access request.
- **Server Component vs. Client Component**: Server Components (the Next.js default) run only
  on the server/at build time and ship no JS to the browser; Client Components (`"use
  client"`) run in the browser and can hold state/handle events.
- **Trust policy vs. permissions policy**: a trust policy says who can *assume* an IAM role; a
  permissions policy says what that role can *do* once assumed.
