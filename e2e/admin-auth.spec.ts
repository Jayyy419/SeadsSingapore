import { test, expect, type Page, type Route } from "@playwright/test";

// The Lambda's POST /admin-login is mocked rather than hit live — a real wrong-password attempt
// would consume part of that IP's rate-limit budget on every CI run, and this suite runs
// unattended on every push/PR. This app's own /admin/api/login route runs for real.
async function mockLambdaLogin(page: Page, respond: (route: Route, body: unknown) => Promise<void>) {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
  await page.route(
    (url) => url.pathname === "/admin-login" && url.hostname !== "localhost",
    async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      return respond(route, route.request().postDataJSON());
    }
  );
  return cors;
}

// Token-shaped (`${expiresAtMs}.${hex64}`) but not validly signed — enough for the cookie route,
// which only checks shape and expiry. The Lambda would reject it on any real data call.
const fakeToken = () => `${Date.now() + 60 * 60 * 1000}.${"ab".repeat(32)}`;

test.describe("admin auth", () => {
  test("visiting /admin without a session redirects to the login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("a rejected login shows the Lambda's error and does not navigate away", async ({ page }) => {
    const cors = await mockLambdaLogin(page, (route) =>
      route.fulfill({ status: 401, headers: cors, contentType: "application/json", body: JSON.stringify({ error: "Incorrect password" }) })
    );

    await page.goto("/admin/login");
    await page.getByPlaceholder(/password/i).fill("definitely-wrong");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/incorrect password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("the rate-limit message comes through as-is", async ({ page }) => {
    const cors = await mockLambdaLogin(page, (route) =>
      route.fulfill({ status: 429, headers: cors, contentType: "application/json", body: JSON.stringify({ error: "Too many attempts — please try again in a few minutes." }) })
    );

    await page.goto("/admin/login");
    await page.getByPlaceholder(/password/i).fill("whatever");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/too many attempts/i)).toBeVisible();
  });

  // The rate limit counts attempts per source IP, so the password has to go from the browser
  // straight to the Lambda: proxied through this app's server, every visitor shared one IP and
  // one bucket of attempts.
  test("the password goes straight to the Lambda; this app's server only ever sees the token", async ({ page, context }) => {
    const token = fakeToken();
    let lambdaBody: unknown;
    const cors = await mockLambdaLogin(page, async (route, body) => {
      lambdaBody = body;
      await route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ ok: true, token }) });
    });
    const appLogin = page.waitForRequest((req) => new URL(req.url()).pathname === "/admin/api/login");
    // Stop at the redirect — /admin itself would call the live Lambda with this unsigned token.
    await page.route((url) => url.pathname === "/admin" && url.hostname === "localhost", (route) => route.fulfill({ status: 200, body: "admin" }));

    await page.goto("/admin/login");
    await page.getByPlaceholder(/password/i).fill("correct horse");
    await page.getByRole("button", { name: /log in/i }).click();

    expect((await appLogin).postDataJSON()).toEqual({ token });
    await expect(page).toHaveURL(/\/admin$/);
    expect(lambdaBody).toEqual({ password: "correct horse" });

    const cookie = (await context.cookies()).find((c) => c.name === "seads_admin_session");
    expect(cookie?.value).toBe(token);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Strict");
  });

  test("with two-factor on, the password step asks for a code, then sends both together", async ({ page, context }) => {
    const token = fakeToken();
    const bodies: unknown[] = [];
    const cors = await mockLambdaLogin(page, async (route, body) => {
      bodies.push(body);
      const withCode = (body as { code?: string }).code;
      await route.fulfill(
        withCode
          ? { status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ ok: true, token }) }
          : { status: 401, headers: cors, contentType: "application/json", body: JSON.stringify({ code: "totp_required", error: "Enter the code" }) }
      );
    });
    await page.route((url) => url.pathname === "/admin" && url.hostname === "localhost", (route) => route.fulfill({ status: 200, body: "admin" }));

    await page.goto("/admin/login");
    await page.getByPlaceholder(/password/i).fill("correct horse");
    await page.getByRole("button", { name: /log in/i }).click();

    const codeField = page.getByRole("textbox", { name: "Code" });
    await expect(codeField).toBeVisible();
    await expect(page.getByText(/authenticator app/i)).toBeVisible();
    await expect(page.getByText(/enter the code/i)).toHaveCount(0); // a prompt, not an error

    await codeField.fill("123456");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/admin$/);
    expect(bodies).toEqual([{ password: "correct horse" }, { password: "correct horse", code: "123456" }]);
    expect((await context.cookies()).find((c) => c.name === "seads_admin_session")?.value).toBe(token);
  });

  test("the cookie route refuses anything that isn't an unexpired token", async ({ request }) => {
    const post = (data: unknown, headers?: Record<string, string>) => request.post("/admin/api/login", { data, headers });

    expect((await post({ token: "not-a-token" })).status()).toBe(400);
    expect((await post({ token: `${Date.now() - 1000}.${"ab".repeat(32)}` })).status()).toBe(400);
    expect((await post({ password: "correct horse" })).status()).toBe(400);
    // A cross-site form can only send simple content types; requiring JSON forces a preflight.
    expect((await post(`token=${fakeToken()}`, { "Content-Type": "application/x-www-form-urlencoded" })).status()).toBe(415);
    expect((await post({ token: fakeToken() })).status()).toBe(200);
  });
});

// Note proxy.ts is only a presence-and-expiry gate (see hasUnexpiredSessionCookie); the real
// security boundary is the Lambda verifying the token's HMAC and session epoch on every
// /internal/* call, which backend/interest-form/test/security.test.mjs covers directly.
