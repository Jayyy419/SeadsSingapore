import { test, expect } from "@playwright/test";

// These tests mock the login Route Handler instead of hitting the live Lambda — a real
// wrong-password attempt would consume part of that IP's rate-limit budget on every CI run,
// and this suite runs unattended on every push/PR.
test.describe("admin auth", () => {
  test("visiting /admin without a session redirects to the login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("a rejected login shows an error and does not navigate away", async ({ page }) => {
    await page.route("**/admin/api/login", (route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "Incorrect password" }) })
    );

    await page.goto("/admin/login");
    await page.getByPlaceholder(/password/i).fill("definitely-wrong");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/incorrect password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

// Deliberately not tested here: the successful-login path. Full coverage would require either
// a real password against the live Lambda or forging a validly-signed session token, neither
// of which belongs in an unattended suite — proxy.ts's cookie validation (the actual security
// boundary) is exercised by the "no session" test above instead.
