import { test, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { call, state, resetState, seed, getItem, allItems, TABLES, seedAdminAndLogin, eventDate } from "./harness.mjs";

let token;
beforeEach(async () => {
  resetState();
  token = await seedAdminAndLogin();
});

const seedEvent = (slug, overrides = {}) =>
  seed(TABLES.EVENTS_TABLE, { slug, title: { en: "Beach Cleanup" }, date: eventDate(7), location: { en: "East Coast" }, capacity: 2, rsvpCount: 2, ...overrides });

const seedRsvp = (id, slug, rsvpStatus, submittedAt, email = `${id}@example.com`) =>
  seed(TABLES.TABLE_NAME, { id, name: `Person ${id}`, email, interestType: "event", eventSlug: slug, rsvpStatus, submittedAt });

const remove = (id) => call("DELETE", `/internal/submissions/${id}`, { token });
const statusOf = (id) => getItem(TABLES.TABLE_NAME, id)?.rsvpStatus;
const countOf = (slug) => getItem(TABLES.EVENTS_TABLE, slug).rsvpCount;

describe("a freed RSVP slot is given back", () => {
  test("with nobody waiting, deleting a confirmed RSVP releases its slot for the next person", async () => {
    seedEvent("full");
    seedRsvp("a", "full", "confirmed", "2026-01-01");
    seedRsvp("b", "full", "confirmed", "2026-01-02");

    const res = await remove("a");
    assert.equal(res.status, 200);
    assert.equal(countOf("full"), 1, "the deleted RSVP's slot must be released");

    // The real-world consequence: the next RSVP is confirmed, not waitlisted.
    await call("POST", "/submit-interest", {
      body: { name: "New", email: "new@example.com", interestType: "event", eventSlug: "full", turnstileToken: "ok" },
    });
    assert.equal(allItems(TABLES.TABLE_NAME).find((i) => i.email === "new@example.com").rsvpStatus, "confirmed");
    assert.equal(res.body.promoted, null);
  });

  test("with a waitlist, the slot goes straight to the earliest waitlisted person", async () => {
    seedEvent("full");
    seedRsvp("a", "full", "confirmed", "2026-01-01");
    seedRsvp("b", "full", "confirmed", "2026-01-02");
    seedRsvp("late", "full", "waitlisted", "2026-01-05");
    seedRsvp("early", "full", "waitlisted", "2026-01-03"); // seeded second, but asked first

    const res = await remove("a");

    assert.equal(res.body.promoted, "early", "earliest by submittedAt, not by storage order");
    assert.equal(statusOf("early"), "confirmed");
    assert.ok(getItem(TABLES.TABLE_NAME, "early").promotedAt);
    assert.equal(statusOf("late"), "waitlisted");
    assert.equal(countOf("full"), 2, "the slot transferred, so the count is unchanged");
  });

  test("the promoted person is told", async () => {
    seedEvent("full");
    seedRsvp("a", "full", "confirmed", "2026-01-01");
    seedRsvp("w", "full", "waitlisted", "2026-01-03", "waiting@example.com");

    await remove("a");

    const mail = state.emails.find((e) => e.to[0] === "waiting@example.com");
    assert.ok(mail, "promotion email sent");
    assert.match(mail.subject, /spot opened up/i);
    assert.match(mail.body, /^Hi Person w,/);
    assert.match(mail.body, /Beach Cleanup/);
  });

  test("a promotion is recorded in the audit log", async () => {
    seedEvent("full");
    seedRsvp("a", "full", "confirmed", "2026-01-01");
    seedRsvp("w", "full", "waitlisted", "2026-01-03");

    await remove("a");

    const actions = allItems(TABLES.AUDIT_LOG_TABLE).map((e) => `${e.action} ${e.entityType}`);
    assert.ok(actions.includes("delete submission"));
    assert.ok(actions.includes("promote rsvp"));
  });
});

describe("when not to promote", () => {
  test("deleting a waitlisted RSVP changes nothing else — it never held a slot", async () => {
    seedEvent("full");
    seedRsvp("a", "full", "confirmed", "2026-01-01");
    seedRsvp("w1", "full", "waitlisted", "2026-01-03");
    seedRsvp("w2", "full", "waitlisted", "2026-01-04");

    const res = await remove("w1");

    assert.equal(res.body.promoted, null);
    assert.equal(countOf("full"), 2);
    assert.equal(statusOf("w2"), "waitlisted");
  });

  for (const [why, overrides] of [
    ["cancelled", { status: "cancelled" }],
    ["postponed", { status: "postponed" }],
    ["already past", { date: eventDate(-2) }],
  ]) {
    test(`nobody is promoted into an event that's ${why}`, async () => {
      seedEvent("e", overrides);
      seedRsvp("a", "e", "confirmed", "2026-01-01");
      seedRsvp("w", "e", "waitlisted", "2026-01-03");

      const res = await remove("a");

      assert.equal(res.body.promoted, null);
      assert.equal(statusOf("w"), "waitlisted");
      assert.equal(countOf("e"), 1, "the slot is still released");
    });
  }

  test("if capacity was lowered below the count, a deletion doesn't hand out a slot that isn't there", async () => {
    seedEvent("shrunk", { capacity: 2, rsvpCount: 4 });
    seedRsvp("a", "shrunk", "confirmed", "2026-01-01");
    seedRsvp("w", "shrunk", "waitlisted", "2026-01-03");

    const res = await remove("a");

    assert.equal(res.body.promoted, null);
    assert.equal(statusOf("w"), "waitlisted");
    assert.equal(countOf("shrunk"), 3);
  });

  test("an event with no capacity limit just has its count decremented", async () => {
    seedEvent("open", { capacity: undefined, rsvpCount: 5 });
    seedRsvp("a", "open", "confirmed", "2026-01-01");

    assert.equal((await remove("a")).body.promoted, null);
    assert.equal(countOf("open"), 4);
  });

  test("only that event's waitlist is considered", async () => {
    seedEvent("one");
    seedEvent("two");
    seedRsvp("a", "one", "confirmed", "2026-01-01");
    seedRsvp("other", "two", "waitlisted", "2026-01-02");

    assert.equal((await remove("a")).body.promoted, null);
    assert.equal(statusOf("other"), "waitlisted");
  });

  test("deleting a non-RSVP submission touches no event", async () => {
    seedEvent("full");
    seed(TABLES.TABLE_NAME, { id: "vol", name: "V", email: "v@example.com", interestType: "volunteer", submittedAt: "2026-01-01" });

    const res = await remove("vol");

    assert.equal(res.status, 200);
    assert.equal(countOf("full"), 2);
    assert.equal(getItem(TABLES.TABLE_NAME, "vol"), undefined);
  });

  test("the count never goes negative", async () => {
    seedEvent("drift", { rsvpCount: 0 });
    seedRsvp("a", "drift", "confirmed", "2026-01-01");

    assert.equal((await remove("a")).status, 200);
    assert.equal(countOf("drift"), 0);
  });
});
