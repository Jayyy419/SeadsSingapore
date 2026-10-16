import { test, expect, type Page } from "@playwright/test";

// The header vine: drawn in on first visit, leaves unfurling along it, a leaf perking up over
// whichever nav group is open. These guard the properties that are easy to break silently when
// the geometry in src/lib/vine.ts is tuned.

// Each leaf's stalk position, read from the pivot its unfurl animation rotates around.
async function leafAnchors(page: Page) {
  return page.locator(".seads-leaf-unfurl").evaluateAll((els) =>
    els.map((el) => {
      const [x, y] = (el as HTMLElement).style.transformOrigin.split(" ").map(parseFloat);
      return { x, y };
    })
  );
}

test.describe("header vine", () => {
  test("every leaf is fully inside the header — none clipped by the top of the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".seads-leaf-blade").first()).toBeAttached();
    await page.waitForTimeout(2500); // let the intro finish

    const tops = await page.locator(".seads-leaf-blade").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(tops.length).toBeGreaterThan(6);
    for (const top of tops) expect(top).toBeGreaterThanOrEqual(0);
  });

  test("on mobile, leaves don't pile up at the hidden nav's positions", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    await expect(page.locator(".seads-leaf-unfurl").first()).toBeAttached();

    // With the nav hidden, its buttons all measure as zero-width at one spot; leaves aligned to
    // them used to stack there, four deep, beside the logo.
    const anchors = await leafAnchors(page);
    for (let i = 0; i < anchors.length; i++) {
      for (let j = i + 1; j < anchors.length; j++) {
        expect(Math.abs(anchors[i].x - anchors[j].x), `leaves ${i} and ${j} share a stalk position`).toBeGreaterThan(2);
      }
    }
  });

  test("opening a nav group perks up exactly that group's leaf", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".seads-leaf-perk").first()).toBeAttached();
    await expect(page.locator('.seads-leaf-perk[data-perked="true"]')).toHaveCount(0);

    await page.getByRole("navigation").first().getByRole("link", { name: "Get Involved", exact: true }).hover();
    await expect(page.locator('.seads-leaf-perk[data-perked="true"]')).toHaveCount(1);

    await page.mouse.move(5, 400);
    await expect(page.locator('.seads-leaf-perk[data-perked="true"]')).toHaveCount(0);
  });

  test("with reduced motion, the vine is already fully drawn — no animation to sit through", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const stroke = page.locator(".seads-vine-stroke").first();
    await expect(stroke).toBeAttached();

    await expect.poll(() => stroke.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset)), { timeout: 1000 }).toBe(0);
    const leafOpacity = await page.locator(".seads-leaf-unfurl").first().evaluate((el) => getComputedStyle(el).opacity);
    expect(leafOpacity).toBe("1");
    await context.close();
  });

  test("the intro plays once per session; a reload shows the vine straight away", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".seads-vine-stroke").first()).toBeAttached();
    await expect(page.locator("svg.seads-vine-settled")).toHaveCount(0);

    await page.reload();
    await expect(page.locator(".seads-vine-stroke").first()).toBeAttached();
    await expect(page.locator("svg.seads-vine-settled")).toHaveCount(1);
  });
});
