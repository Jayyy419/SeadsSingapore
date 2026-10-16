import { test, expect, type Page } from "@playwright/test";

// Deleting your own data (and unsubscribing) from the emailed My activity link. The API is
// mocked; ownership checks and the RSVP slot release are in
// backend/interest-form/test/my-activity-delete.test.mjs.
const ACTIVITY = [
  { id: "rsvp1", submittedAt: "2026-03-02T00:00:00Z", interestType: "event", eventSlug: "beach-cleanup", eventTitle: "Beach Cleanup", eventDate: "18 Nov 2026", rsvpStatus: "confirmed" },
  { id: "news1", submittedAt: "2026-03-01T00:00:00Z", interestType: "newsletter", eventSlug: null, eventTitle: null, eventDate: null, rsvpStatus: null },
  { id: "vol1", submittedAt: "2026-02-01T00:00:00Z", interestType: "volunteer", eventSlug: null, eventTitle: null, eventDate: null, rsvpStatus: null },
];

async function mockApi(page: Page) {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
  let activity = [...ACTIVITY];
  const deletes: unknown[] = [];
  await page.route(
    (url) => url.hostname !== "localhost" && (url.pathname === "/my-activity" || url.pathname === "/my-activity/delete"),
    async (route) => {
      if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
      const body = route.request().postDataJSON();
      if (new URL(route.request().url()).pathname === "/my-activity/delete") {
        deletes.push(body);
        activity = body.all ? [] : activity.filter((item) => item.id !== body.id);
      }
      return route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ email: "ana@example.com", activity }) });
    }
  );
  return deletes;
}

test.describe("deleting your data from My activity (mocked)", () => {
  test("each entry offers the right action: cancel an RSVP, unsubscribe, or delete", async ({ page }) => {
    await mockApi(page);
    await page.goto("/my-activity#token=tok");

    await expect(page.getByRole("button", { name: "Cancel RSVP" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Unsubscribe" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete", exact: true })).toBeVisible();
  });

  test("unsubscribing removes the newsletter entry after a confirmation", async ({ page }) => {
    const deletes = await mockApi(page);
    await page.goto("/my-activity#token=tok");
    page.once("dialog", (d) => d.accept());

    await page.getByRole("button", { name: "Unsubscribe" }).click();

    await expect(page.getByRole("button", { name: "Unsubscribe" })).toHaveCount(0);
    await expect(page.getByText("Deleted.")).toBeVisible();
    expect(deletes).toEqual([{ token: "tok", id: "news1" }]);
  });

  test("dismissing the confirmation deletes nothing", async ({ page }) => {
    const deletes = await mockApi(page);
    await page.goto("/my-activity#token=tok");
    page.once("dialog", (d) => d.dismiss());

    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page.getByRole("button", { name: "Delete", exact: true })).toBeVisible();
    expect(deletes).toEqual([]);
  });

  test("'Delete all my data' empties the list", async ({ page }) => {
    const deletes = await mockApi(page);
    await page.goto("/my-activity#token=tok");
    page.once("dialog", (d) => d.accept());

    await page.getByRole("button", { name: "Delete all my data" }).click();

    await expect(page.getByText("Beach Cleanup")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete all my data" })).toHaveCount(0);
    expect(deletes).toEqual([{ token: "tok", all: true }]);
  });
});
