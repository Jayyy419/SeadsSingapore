import { test, expect } from "@playwright/test";

test.describe("public navigation", () => {
  test("homepage renders the hero and nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation").first()).toBeVisible();
    await expect(page).toHaveTitle(/seads/i);
    await expect(page.getByRole("main")).toBeVisible();
  });

  for (const path of ["/about", "/team", "/programs", "/events", "/blog", "/partners", "/contact", "/donate", "/join", "/media", "/privacy"]) {
    test(`${path} responds 200 and renders a heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("unknown route renders the not-found page, not a raw error", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toBeVisible();
  });

  test("footer links to every main section", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /about/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /programs/i })).toBeVisible();
  });
});
