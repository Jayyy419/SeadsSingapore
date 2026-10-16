import { test, expect, type Page, type Route } from "@playwright/test";

// Intercepts only the cross-origin API call. A plain "**/my-activity" glob would also match
// this app's own /my-activity page navigation and replace the whole document with the mock.
async function mockActivityApi(page: Page, respond: (route: Route, body: unknown) => Promise<void>) {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
  await page.route(
    (url) => url.pathname === "/my-activity" && url.hostname !== "localhost",
    async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      return respond(route, route.request().postDataJSON());
    }
  );
  return cors;
}

// The my-activity lookup is a two-step email-verified flow (see my-activity-content.tsx). The
// API is mocked here, like the rest of this suite; the backend's side — signing, expiry, the
// identical answer for unknown addresses — is covered in backend/interest-form/test/.
test.describe("my activity (email-verified, mocked)", () => {
  test("asking for a link only ever sends the email address, and shows no activity", async ({ page }) => {
    let requestBody: unknown;
    const cors = await mockActivityApi(page, async (route, body) => {
      requestBody = body;
      await route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/my-activity");
    await page.getByRole("textbox", { name: /you@example\.com/i }).fill("alice@example.com");
    await page.getByRole("button", { name: /email me a link/i }).click();

    await expect(page.getByText(/we've emailed it a link/i)).toBeVisible();
    expect(requestBody).toEqual({ email: "alice@example.com" });
  });

  test("the emailed link shows that address's activity, then strips the token from the URL", async ({ page }) => {
    let requestBody: unknown;
    const cors = await mockActivityApi(page, async (route, body) => {
      requestBody = body;
      await route.fulfill({
        status: 200,
        headers: cors,
        contentType: "application/json",
        body: JSON.stringify({
          email: "alice@example.com",
          activity: [
            {
              submittedAt: "2026-03-01T00:00:00Z",
              interestType: "event",
              eventSlug: "beach-cleanup",
              eventTitle: "Beach Cleanup",
              eventDate: "18 Jul 2026",
              rsvpStatus: "confirmed",
            },
          ],
        }),
      });
    });

    await page.goto("/my-activity#token=signed.token-value");

    await expect(page.getByText("Beach Cleanup")).toBeVisible();
    await expect(page.getByText("alice@example.com")).toBeVisible();
    expect(requestBody).toEqual({ token: "signed.token-value" });
    // The token must not linger in the address bar or browser history.
    expect(new URL(page.url()).hash).toBe("");
  });

  test("an expired link says so and offers the form again", async ({ page }) => {
    const cors = await mockActivityApi(page, (route) =>
      route.fulfill({
        status: 401,
        headers: cors,
        contentType: "application/json",
        body: JSON.stringify({ error: "This link is invalid or has expired.", code: "invalid_token" }),
      })
    );

    await page.goto("/my-activity#token=stale.token");

    await expect(page.getByText(/expired or isn't valid/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /email me a link/i })).toBeVisible();
  });
});

test("security headers include COOP and an explicit object-src", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["cross-origin-opener-policy"]).toBe("same-origin");
  expect(res.headers()["content-security-policy"]).toContain("object-src 'none'");
});
