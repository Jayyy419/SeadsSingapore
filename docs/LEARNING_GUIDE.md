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
8. [Part 8: Tags, Cost Allocation, and Project-Level Billing](#part-8-tags-cost-allocation-and-project-level-billing)
9. [Part 9: Monitoring, Bot Protection, and Accessibility](#part-9-monitoring-bot-protection-and-accessibility)
10. [Part 10: Dynamic Routes and Fixing a "Told You To, But Couldn't" Bug](#part-10-dynamic-routes-and-fixing-a-told-you-to-but-couldnt-bug)
11. [Part 11: Making the Whole Site Actually Multi-Language](#part-11-making-the-whole-site-actually-multi-language)
12. [Part 12: Building an Admin Panel Without Giving the Website Its Own AWS Permissions](#part-12-building-an-admin-panel-without-giving-the-website-its-own-aws-permissions)
13. [Glossary](#glossary)

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

## Part 8: Tags, Cost Allocation, and Project-Level Billing

### Why you can't just "rename" resources for billing

A natural instinct when you want cleaner billing is to rename things so they're obviously
grouped. The problem: most AWS resource *names* are immutable once created — a Lambda
function name, a DynamoDB table name, an IAM role name, an API Gateway API name. There's no
`rename` API for these; the only way to "rename" one is to delete it and recreate it under
the new name (which is what actually happened during the region move in Part 7, incidentally
— new region meant new resources anyway).

What billing and cost tools actually key off is **tags** — arbitrary key/value labels you
attach to a resource, separate from its name. Every resource in this project got two tags:

```
Project=SeadsSingapore
Environment=Production
```

Tagging is per-service (there's no one API that tags everything at once):

```bash
aws lambda tag-resource --resource <lambda-arn> --tags Project=SeadsSingapore
aws dynamodb tag-resource --resource-arn <table-arn> --tags Key=Project,Value=SeadsSingapore
aws apigatewayv2 tag-resource --resource-arn <api-arn> --tags Project=SeadsSingapore
aws amplify tag-resource --resource-arn <app-arn> --tags Project=SeadsSingapore
aws logs tag-log-group --log-group-name <name> --tags Project=SeadsSingapore
aws sesv2 tag-resource --resource-arn <identity-arn> --tags Key=Project,Value=SeadsSingapore
```

Notice the tag *syntax* differs slightly per service (`Key=X,Value=Y` for some, `X=Y`
shorthand for others) — this is just an inconsistency in how each AWS service's CLI commands
were designed over the years, not a meaningful distinction.

### Turning tags into actual cost visibility

Tagging a resource doesn't automatically make it show up in cost reports — the tag *key* has
to be activated as a **cost allocation tag** first (a one-time, account-level switch):

```bash
aws ce update-cost-allocation-tags-status \
  --cost-allocation-tags-status TagKey=Project,Status=Active TagKey=Environment,Status=Active
```

After activation, AWS Cost Explorer can filter/group spend by that tag — but there's a real
delay: tag-based cost data typically takes up to 24 hours to start populating, since it's
processed from billing data that isn't instant.

### Why this project ended up with two budgets

This AWS account isn't dedicated to just this one project — it also hosts other, unrelated
apps. The original `seads-monthly-budget` (from Part 6) had no cost filter, so it was
actually tracking the *entire account's* spend, not just Seads. Once resources were tagged,
it became possible to create a second budget scoped specifically to this project:

```json
{
  "BudgetName": "seads-singapore-project-budget",
  "BudgetLimit": { "Amount": "30.0", "Unit": "USD" },
  "CostFilters": { "TagKeyValue": ["user:Project$SeadsSingapore"] },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

The `"user:Project$SeadsSingapore"` syntax is AWS Budgets' specific format for
`user:<tag key>$<tag value>` — the `user:` prefix distinguishes tags *you* applied from AWS's
own built-in cost dimensions (like `LINKED_ACCOUNT` or `SERVICE`). The account-wide budget
was kept alongside the new project-scoped one, not replaced — one is a safety net against
*any* runaway cost in the account, the other is accurate per-project tracking.

### The honest limit: you can track spend by project, but not literally split the bill

Worth being direct about what this does and doesn't achieve. Tags + Cost Explorer + a scoped
Budget give you accurate **visibility and alerting** per project — you'll know exactly what
Seads costs and get warned before it overspends. What they *don't* do is split the actual
**invoice/payment** — AWS still bills the account as one consolidated charge; there's no way
to route part of a single account's bill to a different payment method by tag. If you ever
genuinely needed separate bills (e.g., different projects billed to different clients or
departments), the real mechanism is **separate AWS accounts under an AWS Organization** with
consolidated billing — each linked account gets its own itemized costs, and more advanced
Organizations billing features can even route payment differently per account. That's real
infrastructure overhead (separate account = separate everything, IAM included), so it's only
worth it once a single tagged budget genuinely stops being enough.

---

## Part 9: Monitoring, Bot Protection, and Accessibility

### Why WAF turned out not to apply here

The plan was: put AWS WAF in front of the interest-form API Gateway for managed rule sets
(SQLi/XSS patterns) and per-IP rate limiting. First attempt failed outright:

```
aws wafv2 associate-web-acl --web-acl-arn ... --resource-arn arn:aws:apigateway:...
# Error: The ARN isn't valid.
```

The real cause wasn't a malformed ARN — it's that **AWS WAF doesn't support API Gateway HTTP
APIs at all**, only the older REST API type (plus ALBs, CloudFront, AppSync, Cognito, a few
others). This project deliberately used an HTTP API (cheaper, simpler, and what AWS itself
recommends for new projects — see Part 3), which put it outside WAF's supported resource
list. The two ways around it — migrate to a REST API, or put a CloudFront distribution in
front of the HTTP API just to get something WAF *can* attach to — were both judged not worth
the added infrastructure for a single contact-form endpoint. Lesson: check a service's
supported-resource list *before* designing around it; "AWS WAF" as a name doesn't tell you
which API Gateway generation it covers.

The actual decision was to lean on two cheaper mechanisms instead: the throttle already on
the API Gateway stage (Part 6), and Turnstile (below), which stops most bot traffic before it
even reaches the API.

### CloudWatch Alarms: turning a metric into an email

A metric on its own (like the Lambda's `Errors` count) just sits in CloudWatch until someone
happens to look at it. An **alarm** watches a metric and fires an **action** — usually
publishing to an SNS topic — when a condition holds:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name seads-interest-form-lambda-errors \
  --namespace AWS/Lambda --metric-name Errors \
  --dimensions Name=FunctionName,Value=seads-interest-form-handler \
  --statistic Sum --period 300 --evaluation-periods 1 \
  --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \
  --treat-missing-data notBreaching \
  --alarm-actions arn:aws:sns:ap-southeast-1:140023398409:seads-alerts
```

Read this as: "sum up `Errors` over each 300-second window; if any single window's sum is
`>= 1`, fire." `--evaluation-periods 1` means react to the very first bad window rather than
waiting for a streak — appropriate here since even one error on a low-traffic form is worth a
look. `--treat-missing-data notBreaching` matters more than it looks: with *no* traffic at
all (no error metric published), the default behavior is to treat that as `INSUFFICIENT_DATA`
which some alarm configurations treat as alarming — telling it to treat silence as "fine, not
breaching" avoids false alarms on a quiet Tuesday.

SNS (Simple Notification Service) is the fan-out layer between the alarm and an actual human:
a **topic** is a named channel, and **subscribers** (an email address, here) get a message
every time something publishes to it:

```bash
aws sns create-topic --name seads-alerts
aws sns subscribe --topic-arn arn:...:seads-alerts --protocol email --notification-endpoint someone@example.org
```

Subscribing doesn't take effect immediately — AWS emails a confirmation link first, so a
malicious actor can't subscribe *your* inbox to spam by knowing the topic ARN.

### Route 53 health checks: uptime monitoring without an AWS Amplify domain

Uptime monitoring needed two ingredients: something that periodically hits a URL, and an
alarm on the result. AWS Synthetics (scripted browser canaries) can do this but needs an S3
bucket, an IAM execution role, and an actual Node.js script to write and maintain — heavy for
"is this endpoint returning 200." **Route 53 health checks** are the lighter option, and — a
detail worth knowing — they don't require the checked domain to actually be hosted in Route
53's DNS at all; you just give them any hostname/IP to poll:

```bash
aws route53 create-health-check \
  --caller-reference "seads-api-health-$(date +%s)" \
  --health-check-config Type=HTTPS,ResourcePath=/health,FullyQualifiedDomainName=jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com,Port=443,RequestInterval=30,FailureThreshold=3
```

This polls `GET /health` (a route added to the Lambda specifically for this — see below)
every 30 seconds, and flags unhealthy after 3 consecutive failures. `--caller-reference` is a
uniqueness token Route 53 requires to make the create call idempotent/retry-safe — any unique
string works, a timestamp is the easiest choice.

A genuine gotcha: **Route 53 health-check metrics only publish to CloudWatch in `us-east-1`**,
regardless of what region the checked endpoint actually lives in (Route 53 itself is a
global, not regional, service). So even though this project's Lambda alarms are in
`ap-southeast-1`, the health-check alarms — and a second SNS topic to notify, since SNS
topics don't cross regions either — had to be created in `us-east-1`. Both topics ended up
named `seads-alerts`, which is a trap: `arn:aws:sns:ap-southeast-1:...` and
`arn:aws:sns:us-east-1:...` are two completely different resources that happen to share a
name. Always check the region in an ARN, not just the resource name.

Adding the `/health` route itself was two small changes: in the Lambda,

```js
if (method === "GET" && event.rawPath === "/health") {
  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
}
```

placed *before* the JSON-body parsing (a GET request has no body to parse), and in API
Gateway, a second route on the same integration:

```bash
aws apigatewayv2 create-route --api-id jztkgrm3lh --route-key "GET /health" --target integrations/24qff8m
aws lambda add-permission --function-name seads-interest-form-handler \
  --statement-id apigw-invoke-health --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-southeast-1:140023398409:jztkgrm3lh/*/*/health"
```

Reusing the same Lambda integration for a second route is fine — routes are just "which
path/method maps to which backend," and one Lambda can happily serve several routes by
branching on `event.rawPath`/`event.requestContext.http.method` inside the handler, same as
this file already does for `OPTIONS`.

### Amplify PR previews, and the GitHub App vs. personal access token distinction

```bash
aws amplify update-branch --app-id d2mrph1bcp6pjx --branch-name main --enable-pull-request-preview
```

turns on temporary preview deployments for any PR opened against `main`. Worth understanding
why this project doesn't get the fuller experience (an automatic comment on the PR with the
preview link): Amplify was connected to GitHub via a **personal access token** (`--access-token`
on `create-app`, Part 4), which is enough to create a webhook and pull code, but AWS's own
**"AWS Amplify" GitHub App** is a separate, more deeply integrated connection type that also
gets permission to post commit statuses and PR comments back to GitHub. Installing that App
requires an interactive OAuth consent screen in a browser — not something scriptable from a
CLI session — so this project's automation could turn *previews* on, but not the GitHub-side
comment integration; that's a one-time manual step (Amplify console → reconnect the repo) for
whoever owns the GitHub account.

### Verifying a CAPTCHA server-side: the pattern, not just Turnstile specifically

Adding Cloudflare Turnstile to the interest form is a concrete example of a pattern that
applies to any "prove you're not a bot" widget (reCAPTCHA works the same way): **the widget
only produces a token in the browser — it proves nothing by itself**. A bot could simply skip
rendering the widget and POST straight to the API without ever running Cloudflare's
JavaScript. The token only means something once your *backend* asks the CAPTCHA provider
"is this token real," server-to-server:

```js
async function verifyTurnstile(token, remoteIp) {
  const secret = await getTurnstileSecret();
  if (!secret) return true;   // fail open: our own infra problem, not a bot signal
  if (!token) return false;   // fail closed: no token at all

  const body = new URLSearchParams({ secret, response: token, remoteip: remoteIp });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = await res.json();
  return data.success === true;
}
```

The **fail open / fail closed** distinction here is a deliberate design choice, not an
oversight: if Secrets Manager has a blip and the secret key can't be loaded, that's *our*
infrastructure problem, and the form shouldn't go down over it (fail open — let the
submission through). But if the token is missing entirely, or Cloudflare explicitly says
`success: false`, that's the actual case this exists to catch, so it's rejected outright
(fail closed). Getting this backwards in either direction is a real category of bug: too
strict, and a Secrets Manager hiccup takes down a public form; too lenient, and the whole
check becomes decorative.

The secret key itself uses the `seads/*` Secrets Manager convention set up back in Part 6/8,
specifically so that adding it later needed zero IAM changes:

```bash
aws secretsmanager create-secret --name seads/turnstile-secret-key --secret-string "..."
```

...while the *site* key (the public half, embedded directly in the page's HTML) is just a
normal `NEXT_PUBLIC_*` env var — the asymmetry between "safe to expose" (site key) and
"never expose" (secret key) is the whole reason CAPTCHA providers hand out two different
keys instead of one.

### Accessibility bugs that are easy to ship by accident

Two real, shipped bugs worth understanding rather than just the fix:

**Hover-only interactive elements are invisible to keyboard/screen-reader users.** The nav's
dropdown children only ever opened via `onMouseEnter`/`onMouseLeave` — functionally
reasonable for a mouse user, but someone tabbing through the page with a keyboard could reach
the group's link (which now goes to its first child, per an earlier fix) but had *no way at
all* to reach the other children, since they only rendered into the DOM while the mouse was
hovering. The fix mirrors the mouse handlers with focus equivalents:

```tsx
onFocus={() => openGroupHandler(group.key)}
onBlur={(e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) closeGroupHandler(group.key);
}}
```

`onBlur`'s `e.relatedTarget` is the element about to *receive* focus — checking whether the
container still `.contains()` it is what stops the menu from closing when focus moves from
the group's main link to one of its own now-visible children (which is a legitimate focus
move within the same widget, not the user leaving it). Without that check, tabbing from the
group link to its first child would immediately close the very menu you just opened.

**Placeholder text is not a substitute for a label.** The interest-form inputs only ever had
`placeholder="Your name"`-style text, no `<label>` or `aria-label`. This looks fine visually
but has two real problems: placeholder text vanishes the moment a sighted user starts typing
(losing context), and it isn't reliably exposed as the field's *accessible name* to every
screen reader/browser combination the way an explicit label is. Fix was minimal —
`aria-label` reusing the same translated placeholder copy, plus `required` so the browser's
own validation catches an empty submit before it ever reaches the network:

```tsx
<input type="email" name="email" placeholder={t.emailPh} aria-label={t.emailPh} required ... />
```

A form's **result** also needs to be perceivable without vision. A sighted user sees the
"Submission captured" message appear after clicking submit; a screen-reader user hears
nothing unless that DOM change happens inside an `aria-live` region, which tells assistive
tech to announce content changes as they happen rather than only on next navigation:

```tsx
<div aria-live="polite" className="contents">
  {submitStatus === "done" && <p>Submission captured...</p>}
  {submitStatus === "error" && <p>Could not submit right now...</p>}
</div>
```

`className="contents"` (Tailwind's `display: contents`) is there for a CSS reason, not an
accessibility one: the surrounding form is a CSS grid with `md:col-span-2` on its children,
which only works on *direct* grid children. Wrapping the status paragraphs in a plain `<div>`
would break that layout since the div itself would become the grid item instead of the
paragraph inside it; `display: contents` makes the wrapper invisible to the grid/box model
while keeping it present in the DOM (and accessibility tree) for `aria-live` to attach to.

### Auditing bundle size without a full Lighthouse run

No Lighthouse/Chrome available meant checking performance more directly: the `next build`
output lists every route, and the actual compiled JS lives in `.next/static/chunks/`:

```bash
du -sh .next/static/chunks/*.js | sort -rh | head -15   # biggest chunks first
du -sh .next/static/chunks                              # total
```

This project came back small (~836KB raw JS across *every* chunk combined, not per-page —
most routes only load a fraction of that) with nothing to trim, so the real finding was
elsewhere: `grep`-ing `package.json` showed dependencies were already just
Next/React/`@vercel/analytics` — no accidentally-bloated library to remove — and a look at
`public/` turned up five unused SVGs left over from the original `create-next-app` scaffold
(`file.svg`, `globe.svg`, etc.), never referenced anywhere in `src/`. Confirmed with:

```bash
grep -rn "file\.svg\|globe\.svg\|next\.svg\|vercel\.svg\|window\.svg" src/
# (no output = safe to delete)
```

The lesson isn't really about this specific project (which turned out to already be lean) —
it's the general audit shape: check total/per-chunk JS size, check `package.json` for
anything unexpectedly heavy, and grep for dead assets before assuming a performance pass
needs code changes at all. Sometimes the honest answer is "already fine, here's the evidence."

### A CSP bug that "verified end-to-end" testing still missed

Worth understanding in detail, because it's a genuinely easy mistake to repeat: Turnstile was
added, its backend half was verified with a real request (a curl POST with a garbage token,
confirmed rejected), and its frontend half was verified by inspecting the built static HTML
(confirmed the widget `<div>` and script `<script src="https://challenges.cloudflare.com/...">`
were both present with the right site key). Both checks passed. It still shipped broken:
the site's Content-Security-Policy (`next.config.ts`) never had `challenges.cloudflare.com`
in `script-src`, so **every real visitor's browser refused to execute that script** — the
widget never rendered, no token was ever generated, and the Lambda's bot check (correctly)
rejected every genuine submission that had no token.

Why the testing missed it: curl doesn't parse or enforce HTML/CSP at all — it just sends
bytes over HTTP, so a curl-based test can never catch a client-side enforcement mechanism
like CSP. And checking the *static HTML* only confirms the markup a browser *would receive*,
not what a browser actually *does* with it once CSP evaluates each resource. The only way to
have caught this was rendering the page in a real browser and checking the console for CSP
violations — which is exactly what happened one conversation turn later, once
`withSentryConfig` gave a reason to touch `next.config.ts` again and prompted a second look
at the CSP:

```js
page.on('console', msg => consoleMessages.push(msg.text()));
await page.goto('http://localhost:4127/');
// filter for messages mentioning "content security policy"
```

There's a second layer worth noting too: this sandbox's own network policy independently
blocks requests to Cloudflare's domain, for an unrelated reason (it's not on this sandbox's
outbound allowlist — the same restriction that blocked reaching the live Amplify URL directly
throughout this whole project). That meant *even after* fixing the CSP, the Turnstile script
still couldn't be observed actually loading successfully from here — but critically, the
*type* of failure changed from a CSP violation (logged by the browser before any network
request is even attempted) to a network-level failure (the browser tries, and only then
fails) — and that distinction is the actual proof the CSP fix worked, since in the real
Amplify environment (genuine internet access, no sandbox proxy) that second failure mode
doesn't exist at all.

General lesson: "I tested the backend" and "I confirmed the HTML is correct" are both real,
valid checks — but neither one exercises a browser's own enforcement layer (CSP, CORS,
mixed-content blocking, etc.). Any feature that depends on browser-enforced policy needs an
actual browser in the loop to be genuinely verified, not just inspected.

---

## Part 10: Dynamic Routes and Fixing a "Told You To, But Couldn't" Bug

### A bug worth naming precisely

A feature survey of every content page (events, programs, stories, team, partners, join)
turned up several instances of the same underlying problem, worth calling out as its own
category of bug: **a page tells a visitor to do something, but doesn't actually let them do
it.** The clearest example was `/join` — its own copy described a 4-step process where step 2
was "submit your interest details," but the page had no form on it at all, just a link to
`/events`, which linked right back to `/join`. A visitor following the page's own instructions
would loop forever. This is a different failure mode than a crash or a broken build — the
page renders fine, nothing throws, `next build` and every automated check pass clean — the
gap is purely in whether the page's promises match what it actually offers, which nothing
except an attentive human reading the whole site can catch. (The CSP/Turnstile bug in Part 9
was the same category from a different angle: the *code* was internally consistent, the
*infrastructure config* just quietly contradicted it.)

Two smaller versions of the same problem showed up elsewhere: story and program cards on
their listing pages weren't links at all — visually they looked exactly like the clickable
cards used everywhere else on the site (`hover:-translate-y-0.5`, the works), but clicking one
did nothing, because there was no page underneath to click through to. That's arguably worse
than an obviously-static page, since the visual affordance actively promises an interaction
the site can't deliver.

### Dynamic routes: `[slug]` folders and `generateStaticParams`

Fixing the story/program/event gaps meant adding real detail pages. Next.js's App Router uses
a folder literally named `[slug]` to mean "match anything here, and expose it as a `slug`
param":

```
src/app/blog/[slug]/page.tsx   ->  /blog/student-led-mentorship-cell, /blog/anything-else, ...
```

Since this site is fully statically prerendered (no per-request server rendering — see Part
1), Next.js needs to know *every* valid slug value ahead of time, at build time, so it can
generate one static HTML file per story. That's what `generateStaticParams` is for:

```ts
export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}
```

This runs once during `next build`, returns an array of every valid param combination, and
Next.js pre-renders one page per entry — confirmed in the build output as a new `●` (SSG)
row listing each generated path:

```
● /blog/[slug]
  ├ /blog/student-led-mentorship-cell
  ├ /blog/campus-recycling-to-circular-systems
  ...
```

A slug with no matching content (a typo'd URL, a deleted story someone still linked to)
should 404, not crash or silently show blank content — that's `notFound()` from
`next/navigation`, which renders this project's `not-found.tsx` from Part 6:

```ts
const story = stories.find((s) => s.slug === slug);
if (!story) notFound();
```

One Next.js version-specific detail: in current Next.js, the `params` object passed into a
page component is a `Promise`, not a plain object — you `await` it before reading `.slug`.
This is relatively new (older Next.js versions passed params synchronously); the reasoning is
that it lets Next.js start streaming a page's shell before route params are fully resolved,
but the practical effect for a static site like this one is just: remember the `await`.

```tsx
export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  ...
}
```

### Extracting a reusable component instead of copy-pasting a form

The actual `/join` fix wasn't "add a form to `/join`" so much as "there should only be *one*
form implementation, used in multiple places." Before this, the entire interest-form
markup — every input, the Turnstile widget, the submit handler, the status messages — lived
directly inside the homepage's `page.tsx`. Copy-pasting that block onto `/join` (and onto
every new event/program detail page) would have meant four near-identical copies of the same
~80 lines, each one a chance to fix a bug in one place and forget the other three.

The fix was pulling it into `src/components/interest-form.tsx` as a real component with props
for the parts that legitimately vary per placement — heading, body copy, submit button label,
and (new) a `prefillInterest` string:

```tsx
<InterestForm
  eyebrow="RSVP"
  heading={`Join us at ${event.title}`}
  prefillInterest={`RSVP: ${event.title} (${event.date})`}
  prefillInterestType="event"
/>
```

`prefillInterest` is passed straight to the text input's `defaultValue` — not `value`, which
would make it a *controlled* input requiring `onChange` wiring to stay editable. `defaultValue`
just sets the initial value and then leaves the input alone, which is exactly right here: the
visitor arriving from a specific event's RSVP link sees the context pre-filled ("RSVP: Seads
Youth Dialogue 2026 (18 Jul 2026)") but can still freely edit or clear it.

### Structured data alongside free text

The interest form also gained a `<select name="interestType">` (Volunteering / Partnering /
Attending an event / Something else) alongside the existing free-text field. The reasoning:
free text is flexible for the visitor but expensive for whoever on the Seads team has to read
every submission and figure out what to do with it. A small, optional, structured field costs
the visitor almost nothing (one dropdown) but lets staff filter/triage submissions instead of
reading full sentences for every single one. This threaded through three layers that all
needed the same small update: the form component (new field), the Lambda (`INTEREST_TYPES`
allow-list — never trust a value from the client without validating it against a known set),
and the notification email (the type now appears in the subject line, e.g. "New Seads interest
form submission (Volunteering) from...", so it's visible without even opening the email).

---

## Part 11: Making the Whole Site Actually Multi-Language

### The gap, precisely

The locale switcher (EN/中文/BM/HI) has been in the header since the very first version of
this site, and it worked — for the homepage. Nothing else. Every subpage, and even part of
the header itself (the nav *group* labels, as opposed to their dropdown children), stayed in
English no matter what a visitor picked. This is worth naming as its own category of gap,
distinct from the "told you to, but couldn't" bugs in Part 10: the feature *worked exactly as
built*, it just was never built to cover more than one page. Nothing was broken; the scope
had just silently stayed small while the site grew around it.

### Two legitimate architectures, and why the cheaper one was chosen

There are two real ways to make a multi-page Next.js site multi-language:

1. **URL-based routing** (`/en/about`, `/zh/about`, ...) — every language gets its own real,
   crawlable URL. This is what Next.js's own i18n documentation recommends, because it's the
   only approach where Google can actually index the Mandarin/Malay/Hindi versions
   separately. The cost: it restructures every route in the app (`src/app/[locale]/about/...`
   instead of `src/app/about/...`), and every internal link sitewide needs to become
   locale-aware (`/${locale}/about` instead of `/about`). Existing indexed URLs like
   `/about` would need redirects to a default-locale prefix.
2. **Client-side state** — a language preference held in React state and `localStorage`, with
   every page rendering different text for the same URL depending on that state. No routing
   changes, no redirects, much less code to touch. The real cost: search engines only ever
   see one version (whatever the server-rendered default is — English here), since there's no
   separate URL to crawl for the other languages.

This project already had the second approach half-built (the homepage's locale switcher), so
extending it was a fraction of the work of switching architectures mid-project — and this
site doesn't currently depend on non-English search traffic. That's a real, accepted tradeoff
recorded here on purpose, not an oversight: if multi-language SEO ever becomes a priority,
option 1 is the correct next step, and it's a genuine rebuild of the routing layer, not a
small patch.

### A shared context, because prop-drilling locale through every page doesn't scale

The homepage originally owned locale state directly (`useState` in `page.tsx`) and hand-passed
it down to `SiteHeader` via an `onLocaleChange` callback prop. That doesn't extend to "every
page" — you'd need every single page to accept and thread that prop, and `SiteHeader` itself
is rendered from many different places. The fix is a **React Context**, which exists
specifically so state can be read by any component anywhere in the tree without manually
passing it down through every intermediate layer:

```tsx
// src/lib/locale-context.tsx
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en"); // SSR-safe default
  useLayoutEffect(() => { /* correct from localStorage, same pattern as Part 1's nav fix */ }, []);
  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
  };
  return <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale() must be used within a LocaleProvider");
  return ctx;
}
```

Wrapping `{children}` in `<LocaleProvider>` once, in the root `layout.tsx`, makes `useLocale()`
callable from *any* Client Component anywhere in the app — no prop needed. `SiteHeader` was
refactored to consume this instead of owning its own locale state, which also simplified it:
it no longer needs `onLocaleChange` at all, since anything else that needs the locale just
calls `useLocale()` itself.

### Why nearly every page file had to be split in two

This is the part of the exercise that took the most files, for a reason worth understanding
properly: **a file can't both export `metadata` and have `"use client"` at the top.**
`metadata`/`generateStaticParams` are Next.js conventions that only work in Server Components
(they run at build/request time on the server, before any client JavaScript exists) — but
`useLocale()` is a hook, and hooks only work in Client Components. A single page file needed
both. The resolution is the standard pattern for this exact conflict: split into two files.

```tsx
// src/app/about/page.tsx — stays a Server Component, keeps the SEO-relevant exports
export const metadata: Metadata = { title: "About", description: "..." };
export default function AboutPage() {
  return <AboutContent />;
}

// src/app/about/about-content.tsx — a Client Component, does the actual translated rendering
"use client";
export function AboutContent() {
  const { t } = useLocale();
  return <SiteShell title={t.aboutPageTitle} subtitle={t.aboutPageSubtitle}>...</SiteShell>;
}
```

The same split applies to the dynamic detail pages from Part 10, with one extra wrinkle:
`generateMetadata` needs a plain string for the page `<title>`, but the content is now a
`LocalizedString` (`Record<Locale, string>`) — so metadata always uses `.en` specifically
(`title: program.name.en`). This is a direct, visible consequence of the architecture choice
in the previous section: since search engines only ever see the English render anyway, there
was never a "which locale" question to answer for metadata — it's English, deliberately.

### Restructuring content data: from a plain string to one object per language

Beyond UI chrome (headings, buttons, nav labels — all just new keys in `i18n.ts`, the same
file the homepage already used), the actual program/event/story/team content needed
translating too. That meant changing the *shape* of `siteContent.ts`, not just adding
strings to it:

```ts
// before
export type Program = { slug: string; name: string; description: string; ... };

// after
export type LocalizedString = Record<Locale, string>;
export type Program = { slug: string; name: LocalizedString; description: LocalizedString; ... };
```

Every place that read `program.name` as a string now reads `program.name[locale]` instead —
TypeScript caught every single one of these automatically the moment the type changed
(`tsc --noEmit` turned into a checklist: run it, fix the reported line, repeat, until zero
errors), which is a concrete example of why a type system earns its keep on a refactor like
this one — there was no way to *forget* a spot, the compiler enumerated all of them.

### Keeping real links alive inside translated sentences

One subtle regression happened and got caught before shipping: the Privacy Policy originally
had actual `<a href="mailto:...">` and `<a href="https://cloudflare.com/...">` elements
woven into its English sentences. Translating those sentences as plain strings (the
straightforward approach used everywhere else) would have silently turned those two links
into inert text — `hello@seads.sg` and "Cloudflare" would still *appear*, but wouldn't be
clickable, in every language. The fix is a small helper that exploits a genuine fact about
translation: an email address and a brand name don't get translated — they appear as the
exact same literal substring in all four languages' sentences, just in different positions.
So instead of hand-splitting every language's sentence around the link (fragile, and a
maintenance trap the moment a translation changes), the code finds the untranslated substring
wherever it naturally landed and wraps just that piece:

```tsx
function linkify(text: string, needle: string, href: string) {
  const index = text.indexOf(needle);
  if (index === -1) return text;
  return <>{text.slice(0, index)}<a href={href}>{needle}</a>{text.slice(index + needle.length)}</>;
}
```

This is a small example of a broader habit worth having on any translation/localization work:
after translating, re-check for anything in the *original* markup that wasn't plain text —
links, bold spans, inline icons — since a straightforward string-for-string translation
naturally flattens all of that into plain text unless it's deliberately preserved.

---

## Part 12: Building an Admin Panel Without Giving the Website Its Own AWS Permissions

### The gap

Every piece of content on this site — programs, events, stories, team bios, even the
homepage's "40K+ youths reached" stat tiles — lived in one hardcoded TypeScript file
(`siteContent.ts`), edited by hand and shipped through a normal git commit + redeploy. That's
fine for a handful of pages that rarely change, but it meant there was no way for anyone to
update an impact number, moderate a community-submitted story, or check RSVP counts without
touching code. The site needed a real `/admin` section.

### The auth decision: shared password, not per-user accounts

The site has one operator, not a team with different roles, so a full user-account system
(Cognito, NextAuth with a database, etc.) would be solving a problem that doesn't exist yet.
Instead: one password, stored as an Amplify environment variable (`ADMIN_PASSWORD`, never
`NEXT_PUBLIC_`, so it never reaches the browser bundle), checked in a Route Handler
(`src/app/admin/api/login/route.ts`). On success it sets an HttpOnly/Secure/SameSite=Strict
cookie containing a signed, expiring token — not the password itself, so the cookie is safe
to have sitting in the browser for its 8-hour lifetime even if it leaked.

**Why no rate limiting on the login endpoint**, unlike every other public-facing endpoint in
this project: rate limiting defends against brute-forcing a *guessable* secret (a memorable
password, a 6-digit code). `ADMIN_PASSWORD` here is a randomly generated ~120-bit string —
brute-forcing that is computationally infeasible regardless of how many attempts per second
you allow. Adding a rate limiter here would be effort spent on a threat model that doesn't
apply, at the cost of extra code to maintain. The lesson generalizes: match the defense to
the actual secret, don't reach for the same mitigation everywhere out of habit.

### Signing the session cookie: Web Crypto, not node:crypto

The auth check has to run in `src/proxy.ts` (Next.js's current name for what used to be
`middleware.ts` — same purpose, renamed convention as of this Next.js version), which executes
on the **Edge runtime**, not Node.js. `node:crypto`'s `createHmac`/`timingSafeEqual` don't
exist there. The fix (`src/lib/admin-session.ts`) uses the **Web Crypto API**
(`crypto.subtle`), which is available in both the Edge runtime and Node.js — one
implementation works everywhere the code needs to run, instead of maintaining two.

A related, easy-to-miss bug caught while wiring this up: `Response.redirect()`'s returned
headers are immutable in this runtime, so calling `.headers.append("Set-Cookie", ...)` on it
throws `TypeError: immutable` — a real error that only shows up when you actually exercise the
code path (a build/typecheck can't catch it, since `Response.redirect()` is a valid, correctly-
typed call). Fixed by using `NextResponse.redirect()` from `next/server` instead, which has a
proper `.cookies.set()` API. Discovered by testing the actual login flow with curl, not by
reading the code — a reminder that "it compiles and types check" and "it works" are different
claims.

### Where does the data live, if the website itself can't touch AWS?

This is the interesting architectural constraint. Checking `aws amplify get-app` for this
project's `computeRoleArn` shows it's unset — the Next.js SSR compute that Amplify runs has
**no IAM role at all**. It can serve pages and run Route Handlers, but it cannot call
DynamoDB, Secrets Manager, or anything else in AWS directly. Attaching one would mean
provisioning a new IAM role and wiring it into Amplify's compute settings — real infra work
requiring account-admin access this session's scoped-down IAM user intentionally doesn't have
(the same reasoning as Part 6's ops hardening: least privilege).

Rather than requesting broader access just to unblock this, the admin panel's own Route
Handlers and Server Actions **proxy to the interest-form Lambda** instead
(`src/lib/internal-api.ts` calling new `/internal/*` routes added to
`backend/interest-form/index.mjs`). That Lambda already has exactly the DynamoDB permissions
it needs (and only those), and already has its own deploy pipeline via GitHub Actions OIDC —
extending it with a few more routes needed no new infrastructure, just new IAM policy
statements for the two new tables (`seads-impact-metrics`, `seads-story-submissions`), applied
once via `iam:PutRolePolicy` by someone with admin credentials.

The `/internal/*` prefix is gated by a *different* shared secret (`INTERNAL_API_KEY`) than the
admin session cookie — this one is server-to-server only (Amplify's Route Handlers hold it as
an env var, never sent to the browser), so even if someone had a valid admin session, they
couldn't call `/internal/*` directly from the browser; only the Next.js server can.

Reads that aren't actually sensitive (the homepage's impact numbers, approved community
stories, live event RSVP counts) were moved to separate, unauthenticated routes
(`GET /impact-metrics`, `GET /community-stories`, `GET /event-rsvp-counts`) instead of living
behind `/internal/`. There's no reason to gate read access to numbers that are already public
on the homepage — only the *write* path (editing a metric, approving a story) needs the
internal key.

### Two bugs a real browser caught that curl and `tsc` couldn't

**The CSP was silently blocking the interest-form API the whole time.** `next.config.ts`'s
`connect-src` directive listed Vercel, Cloudflare Turnstile, and Sentry — but never the
interest-form API Gateway's own origin. `curl` against that origin works fine, because CSP is
a *browser* enforcement mechanism; it doesn't exist at the HTTP-request level, so no
server-side test or `curl` check will ever catch a CSP misconfiguration. It took an actual
headless-Chromium run (Playwright) to see the "Refused to connect" console error and catch
that this had likely been silently breaking the original "Get Involved" form's real submission
in production all along. Fixed by adding the API's origin to `connect-src`.

**Admin pages that fetch live data broke the CI build.** The four data-driven admin pages
(`/admin/impact-metrics`, `/admin/events`, `/admin/submissions`, `/admin/stories`) have no
dynamic route segments (no `[slug]`), so Next.js's default behavior is to try to statically
prerender them once at build time. That means `npm run build` itself called the internal API
— and failed, because `INTERNAL_API_KEY` correctly isn't set in the CI environment. The fix is
one line per page: `export const dynamic = "force-dynamic"`, telling Next.js this page's
content depends on the request, not just static content, and must never be pre-rendered.
Verified by re-running `npm run build` with the *exact* environment variables CI uses (no
server secrets at all) before pushing, rather than trusting that a build that worked with
secrets present would also work without them.

The general lesson from both: a passing `tsc --noEmit` and a passing `npm run build` with your
own local secrets tell you the code is *type-correct*, not that it *works in the environment
it'll actually run in*. Testing against the real CI environment and a real browser surfaced two
bugs that would otherwise have shipped silently.

### Addendum: the real root cause was one level deeper — and how it was actually found

The CSP fix above genuinely fixed a real bug (confirmed: the form-action violation stopped
appearing in later testing), but login *still* failed afterward — now with "Incorrect
password" on the actually-correct password. Chasing that down to the real root cause is worth
walking through, because the debugging path matters as much as the fix.

**Ruling things out in order, from the outside in.** First reflex: is the code wrong? Compared
the live Amplify app config (`aws amplify get-app --query app.environmentVariables`) against
what the login route reads — they matched. Tried a completely different password
("abc123", set fresh via the console) — same "Incorrect password" result regardless of value.
That's the tell: if *no* password works, the comparison logic isn't the problem — the
`adminPassword` side of the comparison is never actually receiving a real value in the first
place, no matter what gets typed.

**Building a diagnostic instead of continuing to guess.** At this point, further back-and-forth
guessing at browser-side causes would have wasted the user's time. Instead: a temporary,
deliberately narrow endpoint (`/admin/api/debug-env`) that reports only `{set: boolean, length:
number}` per environment variable — enough to answer the actual question ("does `process.env`
have this at all?") without exposing any real secret value even briefly, in a public repo,
over an unauthenticated URL. This is a generally useful pattern: when you can't attach a
debugger to a remote environment, ship the smallest possible probe that answers one specific
question, safely, and remove it once you have the answer.

The probe's answer was unambiguous: every server-only variable read `false`, including ones
that had supposedly just been set. That ruled out "wrong value" entirely and pointed at
"never reaches the runtime at all."

**Following the infrastructure, not just the code.** The build log had shown a `[WARNING]:
!Failed to set up process.env.secrets` line since the very first admin-panel deploy — dismissed
at the time as unrelated to plain (non-"Secrets") environment variables. It wasn't unrelated.
Checking where Amplify Hosting is documented to actually store these values —
`aws ssm get-parameters-by-path --path /amplify/<appId>/<branch>/` — returned an empty list.
Not "access denied," not "wrong value" — genuinely nothing there, despite the Amplify API
confidently reporting the values back via `get-app`. That's the shape of a **control-plane /
data-plane split**: the API that lets you *set* configuration and the actual mechanism that
*delivers* it to the running system are two different things, and one can silently succeed
while the other silently does nothing.

**The fix that was tried and didn't work — and why that's still useful information.** Amplify
apps can have an `iamServiceRoleArn` (lets Amplify's own control plane act on your behalf
during builds/deploys) and separately a `computeRoleArn` (lets the deployed SSR functions
themselves call AWS services). This app had neither set. Attaching both — a new IAM role,
trusted by `amplify.amazonaws.com`, with the `AdministratorAccess-Amplify` managed policy —
is the textbook fix for exactly this class of symptom, and the build log's secrets-setup
warning did disappear afterward. But the runtime probe still read `false` across the board
after two more fresh deploys. Confirming a fix *didn't* work is not wasted effort — it
eliminated an entire plausible hypothesis with actual evidence, rather than leaving it as an
unresolved "maybe that was it."

**Deciding when to stop debugging the platform and change the architecture instead.** After
that many independent, correctly-executed configuration changes failed to move the needle,
the responsible call was to stop treating "make Amplify's env-var pipeline work" as the
problem to solve, and instead ask: *what mechanism has actually been reliable all session?*
The interest-form Lambda's own environment variables — set via
`aws lambda update-function-configuration` — had worked correctly every single time, no
exceptions, across many earlier changes. That's a genuinely different code path from Amplify
Hosting's env var propagation (a direct Lambda API call vs. Amplify's internal
build/deploy/SSM plumbing), so its reliability isn't circumstantial.

The fix: move `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` off Amplify entirely, onto the
Lambda. The Lambda gained `POST /admin-login` and `POST /verify-session`; the Next.js side
became a thin proxy that forwards a password or a session token and trusts the Lambda's
answer, never touching a local secret itself. `/internal/*` write access now checks the same
session token instead of a separate static key — one less secret to keep in sync, and access
is now tied to *being currently logged in* rather than *possessing a long-lived static value*,
which is a strictly better property anyway.

**Verifying the fix couldn't quietly rely on the same broken assumption.** The easy mistake
here would be to test locally with all the right environment variables exported and call it
done — which is exactly the blind spot that let this bug reach production in the first place.
Instead: rebuilt and ran the *entire* build with zero `ADMIN_*`/`INTERNAL_*` variables set
locally, matching production's actual (broken) environment exactly, and drove the full
login → dashboard → logout flow with Playwright against that build. It worked, with no
environment variables involved anywhere in the admin auth path — which is the point: the fix
doesn't depend on Amplify's env var propagation ever getting resolved.

---

## Glossary

- **Accessible name**: the text assistive technology (screen readers) announces for an
  element — computed from a `<label>`/`aria-label` if present, and unreliably from
  `placeholder` if not.
- **App Router**: Next.js's routing system where folders under `src/app/` map directly to
  URL paths.
- **Controlled vs. uncontrolled input**: a controlled input's value is driven by React state
  (`value` + `onChange`); an uncontrolled input just takes an initial `defaultValue` and
  manages its own value in the DOM from then on — simpler when you only need to pre-fill,
  not track, what's typed.
- **Dynamic route**: a Next.js route folder named `[param]` (e.g. `[slug]`) that matches any
  value at that URL segment, exposing it to the page as a param.
- **aria-live region**: an HTML region marked so assistive tech announces content changes
  inside it automatically, without the user needing to navigate to it.
- **ARN**: Amazon Resource Name — AWS's globally unique identifier format for any resource,
  e.g. `arn:aws:lambda:us-east-1:140023398409:function:seads-interest-form-handler`.
- **CORS**: Cross-Origin Resource Sharing — the browser security rule that blocks JavaScript
  on one domain from calling an API on another domain unless that API explicitly allows it.
- **Fail open vs. fail closed**: what a check does when it can't run at all (not when it
  runs and fails) — fail open lets the request through anyway (favors availability), fail
  closed blocks it (favors strictness). Which is correct depends entirely on what the check
  protects.
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
- **SSG (Static Site Generation)**: pre-rendering a page to static HTML at build time rather
  than per-request — what `generateStaticParams` does for each dynamic route value.
- **Trust policy vs. permissions policy**: a trust policy says who can *assume* an IAM role; a
  permissions policy says what that role can *do* once assumed.
