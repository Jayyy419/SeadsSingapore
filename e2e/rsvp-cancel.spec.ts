import { test, expect, type Page } from "@playwright/test";

// The cancel link from an RSVP email. The API is mocked; the backend's side (signing, the slot
// release, waitlist promotion) is covered in backend/interest-form/test/rsvp-cancel.test.mjs.
const RSVP = {
  name: "Ana",
  rsvpStatus: "confirmed",
  eventSlug: "beach-cleanup",
  eventTitle: { en: "Beach Cleanup", zh: "海滩清洁", ms: "Pembersihan Pantai", hi: "समुद्र तट सफ़ाई" },
  eventDate: "20 Nov 2026",
  past: false,
};

async function mockCancelApi(page: Page, respond: (body: { token?: string; confirm?: boolean }) => { status: number; json: unknown }) {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
  const bodies: unknown[] = [];
  await page.route(
    (url) => url.pathname === "/rsvp/cancel" && url.hostname !== "localhost",
    async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      const body = route.request().postDataJSON();
      bodies.push(body);
      const { status, json } = respond(body);
      return route.fulfill({ status, headers: cors, contentType: "application/json", body: JSON.stringify(json) });
    }
  );
  return bodies;
}

test.describe("cancelling an RSVP from the email link (mocked)", () => {
  test("opening the link only shows the RSVP; the button is what cancels it", async ({ page }) => {
    const bodies = await mockCancelApi(page, (b) => (b.confirm ? { status: 200, json: { ok: true } } : { status: 200, json: { rsvp: RSVP } }));

    await page.goto("/rsvp/cancel#token=tok123");

    await expect(page.getByText("Beach Cleanup")).toBeVisible();
    await expect(page.getByText("20 Nov 2026")).toBeVisible();
    // Only views so far (React's dev mode may send that one twice — it changes nothing).
    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) expect(body).toEqual({ token: "tok123" });
    expect(page.url()).not.toContain("tok123"); // stripped from the address bar

    await page.getByRole("button", { name: "Cancel my RSVP" }).click();

    await expect(page.getByText(/you're off the list/i)).toBeVisible();
    expect(bodies.filter((b) => (b as { confirm?: boolean }).confirm)).toEqual([{ token: "tok123", confirm: true }]);
  });

  test("someone on the waitlist is offered to leave it", async ({ page }) => {
    await mockCancelApi(page, () => ({ status: 200, json: { rsvp: { ...RSVP, rsvpStatus: "waitlisted" } } }));
    await page.goto("/rsvp/cancel#token=tok123");

    await expect(page.getByText(/leave the waitlist for/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Leave the waitlist" })).toBeVisible();
  });

  test("'Keep my RSVP' goes back to the event", async ({ page }) => {
    await mockCancelApi(page, () => ({ status: 200, json: { rsvp: RSVP } }));
    await page.goto("/rsvp/cancel#token=tok123");

    await expect(page.getByRole("link", { name: "Keep my RSVP" })).toHaveAttribute("href", "/events/beach-cleanup");
  });

  for (const [why, status, json, text] of [
    ["an invalid or expired link", 401, { code: "invalid_token" }, /invalid or has expired/i],
    ["an RSVP that's already cancelled", 404, { code: "not_found" }, /already been cancelled/i],
  ] as const) {
    test(`${why} says so instead of offering a button`, async ({ page }) => {
      await mockCancelApi(page, () => ({ status, json }));
      await page.goto("/rsvp/cancel#token=tok123");

      await expect(page.getByText(text)).toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel my RSVP" })).toHaveCount(0);
    });
  }

  test("a past event can't be cancelled", async ({ page }) => {
    await mockCancelApi(page, () => ({ status: 200, json: { rsvp: { ...RSVP, past: true } } }));
    await page.goto("/rsvp/cancel#token=tok123");

    await expect(page.getByText(/already taken place/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel my RSVP" })).toHaveCount(0);
  });

  test("without a link, the page explains where to find one and calls nothing", async ({ page }) => {
    const bodies = await mockCancelApi(page, () => ({ status: 200, json: { rsvp: RSVP } }));
    await page.goto("/rsvp/cancel");

    await expect(page.getByText(/link in your RSVP email/i)).toBeVisible();
    expect(bodies).toEqual([]);
  });
});
