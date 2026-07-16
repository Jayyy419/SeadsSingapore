import { test, expect } from "@playwright/test";

// These tests mock GET /site-content (rather than depending on the live Lambda's data) so
// they exercise the frontend's rendering logic deterministically and don't depend on whatever
// an admin happens to have configured in production at test time.
test.describe("site content features (mocked)", () => {
  test("FAQ page renders admin-created entries", async ({ page }) => {
    await page.route("**/site-content", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          media: [],
          testimonials: [],
          faq: [{ itemId: "faq#1", question: "Who can join?", answer: "Anyone aged 15-25." }],
          donate: null,
          social: null,
          announcement: null,
        }),
      })
    );

    await page.goto("/faq");
    await expect(page.getByText("Who can join?")).toBeVisible();
    await page.getByText("Who can join?").click();
    await expect(page.getByText("Anyone aged 15-25.")).toBeVisible();
  });

  test("announcement banner shows the admin message and can be dismissed", async ({ page }) => {
    await page.route("**/site-content", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          media: [],
          testimonials: [],
          faq: [],
          donate: null,
          social: null,
          announcement: { enabled: true, message: "Applications are open!", linkUrl: "/join", linkLabel: "Apply" },
        }),
      })
    );

    await page.goto("/about");
    await expect(page.getByText("Applications are open!")).toBeVisible();
    await page.getByRole("button", { name: /dismiss/i }).click();
    await expect(page.getByText("Applications are open!")).toBeHidden();

    // Dismissal persists across a reload of the same message.
    await page.reload();
    await expect(page.getByText("Applications are open!")).toBeHidden();
  });

  test("social links only render configured platforms", async ({ page }) => {
    await page.route("**/site-content", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          media: [],
          testimonials: [],
          faq: [],
          donate: null,
          social: { instagram: "https://instagram.com/seads" },
          announcement: null,
        }),
      })
    );

    await page.goto("/about");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "instagram" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "tiktok" })).toHaveCount(0);
  });

  test("donate page shows PayNow details once enabled", async ({ page }) => {
    await page.route("**/site-content", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          media: [],
          testimonials: [],
          faq: [],
          donate: { enabled: true, payNowId: "202412345A", instructions: "Include your name." },
          social: null,
          announcement: null,
        }),
      })
    );

    await page.goto("/donate");
    await expect(page.getByText("202412345A")).toBeVisible();
    await expect(page.getByText("Include your name.")).toBeVisible();
  });

  test("donate page keeps the coming-soon state when not enabled", async ({ page }) => {
    await page.route("**/site-content", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ media: [], testimonials: [], faq: [], donate: null, social: null, announcement: null }),
      })
    );

    await page.goto("/donate");
    await expect(page.getByText(/opening soon/i)).toBeVisible();
  });
});
