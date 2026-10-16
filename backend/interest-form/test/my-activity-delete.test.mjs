import { test, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { call, state, resetState, seed, getItem, allItems, TABLES, seedAdminAndLogin, eventDate } from "./harness.mjs";

beforeEach(async () => {
  resetState();
  await seedAdminAndLogin(); // seeds the session secret the activity link is signed with
});

const row = (id, email, extra = {}) => seed(TABLES.TABLE_NAME, { id, name: `Person ${id}`, email, submittedAt: `2026-01-0${id.length}`, ...extra });

async function activityToken(email) {
  await call("POST", "/my-activity", { body: { email } });
  return state.emails.filter((e) => e.to[0] === email).at(-1).body.match(/#token=([A-Za-z0-9_.-]+)/)[1];
}
const del = (token, body) => call("POST", "/my-activity/delete", { body: { token, ...body } });
const ids = () => allItems(TABLES.TABLE_NAME).filter((i) => !String(i.id).startsWith("ratelimit#")).map((i) => i.id).sort();

describe("deleting your own data from My activity", () => {
  test("each entry carries an id to delete it by", async () => {
    row("a", "ana@example.com", { interestType: "volunteer" });
    const token = await activityToken("ana@example.com");
    const res = await call("POST", "/my-activity", { body: { token } });
    assert.equal(res.body.activity[0].id, "a");
  });

  test("one entry can be deleted, leaving the rest", async () => {
    row("a", "ana@example.com", { interestType: "volunteer" });
    row("bb", "ana@example.com", { interestType: "partner" });
    const token = await activityToken("ana@example.com");

    const res = await del(token, { id: "a" });

    assert.equal(res.status, 200);
    assert.deepEqual(ids(), ["bb"]);
    assert.deepEqual(res.body.activity.map((i) => i.id), ["bb"], "the refreshed list comes back");
  });

  test("unsubscribing is deleting the newsletter entry", async () => {
    row("n", "ana@example.com", { interestType: "newsletter" });
    const token = await activityToken("ana@example.com");

    await del(token, { id: "n" });

    assert.equal(allItems(TABLES.TABLE_NAME).some((i) => i.interestType === "newsletter"), false);
    assert.ok(allItems(TABLES.AUDIT_LOG_TABLE).some((e) => e.action === "delete" && /newsletter/.test(e.detail)));
  });

  test("deleting a confirmed RSVP frees the spot for the first person waiting", async () => {
    seed(TABLES.EVENTS_TABLE, { slug: "e", title: { en: "Cleanup" }, date: eventDate(5), location: { en: "Park" }, capacity: 1, rsvpCount: 1 });
    row("a", "ana@example.com", { interestType: "event", eventSlug: "e", rsvpStatus: "confirmed" });
    row("w", "wai@example.com", { interestType: "event", eventSlug: "e", rsvpStatus: "waitlisted" });
    const token = await activityToken("ana@example.com");

    await del(token, { id: "a" });

    assert.equal(getItem(TABLES.TABLE_NAME, "w").rsvpStatus, "confirmed");
    assert.equal(getItem(TABLES.EVENTS_TABLE, "e").rsvpCount, 1);
  });

  test("'delete everything' removes all of that address's entries and nobody else's", async () => {
    row("a", "ana@example.com", { interestType: "volunteer" });
    row("bb", "ANA@example.com", { interestType: "newsletter" });
    row("ccc", "bo@example.com", { interestType: "volunteer" });
    const token = await activityToken("ana@example.com");

    const res = await del(token, { all: true });

    assert.equal(res.status, 200);
    assert.deepEqual(ids(), ["ccc"]);
    assert.deepEqual(res.body.activity, []);
  });
});

describe("it can only ever touch your own data", () => {
  test("someone else's entry can't be deleted with your link", async () => {
    row("a", "ana@example.com", { interestType: "volunteer" });
    row("bb", "bo@example.com", { interestType: "volunteer" });
    const token = await activityToken("ana@example.com");

    const res = await del(token, { id: "bb" });

    assert.equal(res.status, 404);
    assert.deepEqual(ids(), ["a", "bb"]);
  });

  test("without a valid link nothing is deleted", async () => {
    row("a", "ana@example.com", { interestType: "volunteer" });
    assert.equal((await del("forged.token", { all: true })).status, 401);
    assert.equal((await del(undefined, { all: true })).status, 401);
    assert.deepEqual(ids(), ["a"]);
  });

  test("deleting the same entry twice is a 404, not an error", async () => {
    row("a", "ana@example.com", { interestType: "volunteer" });
    const token = await activityToken("ana@example.com");
    await del(token, { id: "a" });
    assert.equal((await del(token, { id: "a" })).status, 404);
  });
});

test("the newsletter confirmation says where to unsubscribe", async () => {
  await call("POST", "/submit-interest", { body: { email: "news@example.com", interestType: "newsletter", turnstileToken: "ok" } });
  const mail = state.emails.find((e) => e.to[0] === "news@example.com");
  assert.match(mail.body, /unsubscribe at any time from https:\/\/seads\.test\/my-activity/);
});
