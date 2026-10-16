import { test, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { call, invoke, state, resetState, seed, getItem, TABLES, seedAdminAndLogin, eventDate } from "./harness.mjs";

beforeEach(async () => {
  resetState();
  await seedAdminAndLogin(); // the cancel link in each reminder is signed with the session secret
});

const seedEvent = (slug, daysFromToday, overrides = {}) =>
  seed(TABLES.EVENTS_TABLE, { slug, title: { en: `Event ${slug}` }, date: eventDate(daysFromToday), location: { en: "Park" }, ...overrides });
const seedRsvp = (id, slug, rsvpStatus = "confirmed") =>
  seed(TABLES.TABLE_NAME, { id, name: `Person ${id}`, email: `${id}@example.com`, interestType: "event", eventSlug: slug, rsvpStatus, submittedAt: "2026-01-01" });
const run = () => invoke({ task: "rsvp-reminders" });
const remindedEmails = () => state.emails.filter((e) => /See you tomorrow/.test(e.subject)).map((e) => e.to[0]).sort();

describe("day-before RSVP reminders", () => {
  test("everyone confirmed for tomorrow's events is reminded — nobody else", async () => {
    seedEvent("tomorrow", 1);
    seedEvent("today", 0);
    seedEvent("next-week", 7);
    seedRsvp("a", "tomorrow");
    seedRsvp("b", "tomorrow");
    seedRsvp("w", "tomorrow", "waitlisted");
    seedRsvp("c", "today");
    seedRsvp("d", "next-week");

    const res = await run();

    assert.equal(res.sent, 2);
    assert.deepEqual(remindedEmails(), ["a@example.com", "b@example.com"]);
  });

  test("the reminder has the event details and a working cancel link", async () => {
    seedEvent("tomorrow", 1, { capacity: 5, rsvpCount: 1 });
    seedRsvp("a", "tomorrow");
    await run();

    const [mail] = state.emails;
    assert.match(mail.subject, /See you tomorrow: Event tomorrow/);
    assert.match(mail.body, /^Hi Person a,/);
    assert.match(mail.body, new RegExp(`Date: ${eventDate(1)}`));
    const token = mail.body.match(/\/rsvp\/cancel#token=([A-Za-z0-9_.-]+)/)[1];
    assert.equal((await call("POST", "/rsvp/cancel", { body: { token, confirm: true } })).status, 200);
    assert.equal(getItem(TABLES.EVENTS_TABLE, "tomorrow").rsvpCount, 0);
  });

  test("running twice (a retry, an overlap) never reminds anyone twice", async () => {
    seedEvent("tomorrow", 1);
    seedRsvp("a", "tomorrow");

    await run();
    const second = await run();

    assert.equal(second.sent, 0);
    assert.equal(remindedEmails().length, 1);
    assert.ok(getItem(TABLES.TABLE_NAME, "a").reminderSentAt);
  });

  test("cancelled and postponed events get no reminders", async () => {
    seedEvent("off", 1, { status: "cancelled" });
    seedEvent("later", 1, { status: "postponed" });
    seedRsvp("a", "off");
    seedRsvp("b", "later");

    assert.equal((await run()).sent, 0);
    assert.equal(state.emails.length, 0);
  });
});

describe("scheduled tasks can't be triggered through the public API", () => {
  test("a request whose body names the task does nothing", async () => {
    seedEvent("tomorrow", 1);
    seedRsvp("a", "tomorrow");

    const res = await call("POST", "/", { body: { task: "rsvp-reminders" } });

    assert.equal(res.status, 404);
    assert.equal(state.emails.length, 0);
  });

  test("an unknown task is refused", async () => {
    assert.deepEqual(await invoke({ task: "drop-tables" }), { ok: false, error: "unknown task" });
  });
});
