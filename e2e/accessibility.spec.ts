import { test, expect } from "@playwright/test";

test.describe("accessibility", () => {
  test("skip link is focusable and jumps to main content", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
    await skipLink.click();
    await expect(page).toHaveURL(/#main-content$/);
  });

  test("media lightbox traps focus and closes on Escape", async ({ page }) => {
    await page.goto("/media");
    const firstPhoto = page.getByRole("button").filter({ has: page.locator("img") }).first();
    await firstPhoto.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /close/i })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(firstPhoto).toBeFocused();
  });

  test("html lang attribute matches the selected locale", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
