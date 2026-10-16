import { test, expect } from "@playwright/test";

// Singapore's PDPA expects people to be told why their data is collected where they hand it
// over. Every form taking personal data says so beside its submit button and links the policy.
test.describe("privacy notices at the point of collection", () => {
  test("the Get Involved form links the privacy policy", async ({ page }) => {
    await page.goto("/join");
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: /submit/i }) }).first();
    await expect(form.getByText(/never for advertising/i)).toBeVisible();
    await expect(form.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
  });

  test("the story form also says an approved story is published under the author's name", async ({ page }) => {
    await page.goto("/blog/submit");
    const main = page.locator("#main-content");
    await expect(main.getByText(/published on our blog under your name/i)).toBeVisible();
    await expect(main.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
  });

  test("the footer newsletter signup links the privacy policy", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Privacy policy" }).first()).toHaveAttribute("href", "/privacy");
  });

  test("the policy covers story submissions and the emails the site sends", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByText("If you submit a community story:")).toBeVisible();
    await expect(page.getByText("Emails we send you:")).toBeVisible();
    await expect(page.getByText(/sign-in cookie for Seads staff/i)).toBeVisible();
  });
});
