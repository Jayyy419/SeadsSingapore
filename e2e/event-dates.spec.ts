import { test, expect, type Page } from "@playwright/test";

// "Past" is decided by the calendar day in Singapore, the same rule the API uses to refuse RSVPs
// (isPastEventDate in backend/interest-form/index.mjs). The clock is pinned to 2am Singapore
// time — still the previous day in UTC — which is exactly when the two used to disagree.
const TWO_AM_SINGAPORE_16_OCT = new Date("2026-10-16T02:00:00+08:00");

const event = (slug: string, date: string, extra: Record<string, unknown> = {}) => ({
  slug,
  date,
  type: { en: "Workshop", zh: "Workshop", ms: "Workshop", hi: "Workshop" },
  title: { en: `Event ${slug}`, zh: `Event ${slug}`, ms: `Event ${slug}`, hi: `Event ${slug}` },
  location: { en: "Somewhere", zh: "Somewhere", ms: "Somewhere", hi: "Somewhere" },
  body: { en: ["Details."], zh: ["Details."], ms: ["Details."], hi: ["Details."] },
  ...extra,
});

async function mockEvents(page: Page, events: unknown[]) {
  const cors = { "Access-Control-Allow-Origin": "*" };
  await page.route(
    (url) => url.hostname !== "localhost" && (url.pathname === "/events" || url.pathname === "/event-rsvp-counts"),
    (route) =>
      route.fulfill({
        status: 200,
        headers: cors,
        contentType: "application/json",
        body: JSON.stringify(new URL(route.request().url()).pathname === "/events" ? { events } : { counts: {} }),
      })
  );
}

test.describe("event dates are judged in Singapore time", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TWO_AM_SINGAPORE_16_OCT);
  });

  test("yesterday's event is listed as past from midnight, not from 8am", async ({ page }) => {
    await mockEvents(page, [event("yesterday", "15 Oct 2026"), event("today", "16 Oct 2026")]);
    await page.goto("/events");

    const past = page.locator("section", { has: page.getByRole("heading", { name: "Past events" }) });
    await expect(past.getByText("Event yesterday")).toBeVisible();
    await expect(past.getByText("Event today")).toHaveCount(0);
    await expect(page.getByText("Event today")).toBeVisible();
  });

  test("a past event's page says it's over and offers no way to RSVP", async ({ page }) => {
    await mockEvents(page, [event("yesterday", "15 Oct 2026")]);
    await page.goto("/events/yesterday");

    await expect(page.getByText(/already taken place/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /join us at/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /whatsapp/i })).toHaveCount(0);
  });

  test("an event happening today still takes RSVPs", async ({ page }) => {
    await mockEvents(page, [event("today", "16 Oct 2026")]);
    await page.goto("/events/today");

    await expect(page.getByRole("heading", { name: /join us at event today/i })).toBeVisible();
    await expect(page.getByText(/already taken place/i)).toHaveCount(0);
  });

  test("a postponed event keeps its RSVP form — the API accepts those RSVPs", async ({ page }) => {
    await mockEvents(page, [event("later", "20 Oct 2026", { status: "postponed" })]);
    await page.goto("/events/later");

    await expect(page.getByText(/has been postponed/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /join us at event later/i })).toBeVisible();
  });
});
