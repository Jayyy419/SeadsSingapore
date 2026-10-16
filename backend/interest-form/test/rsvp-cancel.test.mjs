import { test, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { call, state, resetState, seed, getItem, allItems, TABLES, seedAdminAndLogin, eventDate } from "./harness.mjs";

beforeEach(async () => {
  resetState();
  await seedAdminAndLogin(); // the signing key is derived from the session secret it seeds
});

const seedEvent = (slug, overrides = {}) =>
  seed(TABLES.EVENTS_TABLE, { slug, title: { en: "Beach Cleanup" }, date: eventDate(7), location: { en: "East Coast" }, capacity: 2, rsvpCount: 0, ...overrides });

const rsvp = (slug, email, name = "Ana") =>
  call("POST", "/submit-interest", { body: { name, email, interestType: "event", eventSlug: slug, turnstileToken: "ok" } });

const cancelToken = (email) => {
  const mail = state.emails.filter((e) => e.to[0] === email).at(-1);
  return mail?.body.match(/\/rsvp\/cancel#token=([A-Za-z0-9_.-]+)/)?.[1];
};

const open = (token) => call("POST", "/rsvp/cancel", { body: { token } });
const confirm = (token) => call("POST", "/rsvp/cancel", { body: { token, confirm: true } });
const rsvpsFor = (slug) => allItems(TABLES.TABLE_NAME).filter((i) => i.eventSlug === slug);
const countOf = (slug) => getItem(TABLES.EVENTS_TABLE, slug).rsvpCount;

describe("every RSVP email carries a way to cancel", () => {
  test("a confirmation includes a cancel link; a waitlist email offers to leave the waitlist", async () => {
    seedEvent("e", { capacity: 1 });
    await rsvp("e", "first@example.com");
    await rsvp("e", "second@example.com");

    assert.ok(cancelToken("first@example.com"));
    assert.match(state.emails.find((e) => e.to[0] === "first@example.com").body, /Can't make it after all/);
    assert.match(state.emails.find((e) => e.to[0] === "second@example.com").body, /Leave the waitlist/);
  });

  test("RSVPing again resends a cancel link for the existing RSVP", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");
    await rsvp("e", "ana@example.com");

    assert.match(state.emails.at(-1).subject, /already registered/i);
    const token = cancelToken("ana@example.com");
    assert.equal((await confirm(token)).status, 200);
    assert.equal(rsvpsFor("e").length, 0);
  });
});

describe("cancelling", () => {
  test("opening the link only shows what would be cancelled — mail scanners open links too", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");

    const res = await open(cancelToken("ana@example.com"));

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.rsvp, { name: "Ana", rsvpStatus: "confirmed", eventSlug: "e", eventTitle: { en: "Beach Cleanup" }, eventDate: eventDate(7), past: false });
    assert.equal(rsvpsFor("e").length, 1, "nothing removed");
    assert.equal(countOf("e"), 1);
  });

  test("confirming removes the RSVP and frees its spot", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");

    assert.equal((await confirm(cancelToken("ana@example.com"))).status, 200);
    assert.equal(rsvpsFor("e").length, 0);
    assert.equal(countOf("e"), 0);
  });

  test("on a full event the spot goes straight to the first person waiting, who is emailed", async () => {
    seedEvent("e", { capacity: 1 });
    await rsvp("e", "ana@example.com", "Ana");
    await rsvp("e", "bo@example.com", "Bo");

    await confirm(cancelToken("ana@example.com"));

    const [bo] = rsvpsFor("e");
    assert.equal(bo.email, "bo@example.com");
    assert.equal(bo.rsvpStatus, "confirmed");
    assert.equal(countOf("e"), 1);
    assert.match(state.emails.at(-2).subject, /spot opened up/i);
  });

  test("leaving the waitlist doesn't free a spot that was never held", async () => {
    seedEvent("e", { capacity: 1 });
    await rsvp("e", "ana@example.com");
    await rsvp("e", "bo@example.com");

    await confirm(cancelToken("bo@example.com"));

    assert.deepEqual(rsvpsFor("e").map((i) => i.email), ["ana@example.com"]);
    assert.equal(countOf("e"), 1);
  });

  test("a second confirm (double-click, two tabs) releases the spot only once", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");
    await rsvp("e", "bo@example.com");
    const token = cancelToken("ana@example.com");

    assert.equal((await confirm(token)).status, 200);
    const again = await confirm(token);
    assert.equal(again.status, 404);
    assert.equal(again.body.code, "not_found");
    assert.equal(countOf("e"), 1, "bo's spot is untouched");
  });

  test("the team is told, with the attendee as Reply-To, and it's in the audit log", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");
    await confirm(cancelToken("ana@example.com"));

    const note = state.emails.find((e) => e.to[0] === "team@example.org" && /cancelled/i.test(e.subject));
    assert.ok(note);
    assert.deepEqual(note.replyTo, ["ana@example.com"]);
    assert.ok(allItems(TABLES.AUDIT_LOG_TABLE).some((e) => e.action === "cancel" && e.entityType === "rsvp"));
  });

  test("an event that already happened can be viewed but not cancelled", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");
    seed(TABLES.EVENTS_TABLE, { ...getItem(TABLES.EVENTS_TABLE, "e"), date: eventDate(-1) });
    const token = cancelToken("ana@example.com");

    assert.equal((await open(token)).body.rsvp.past, true);
    const res = await confirm(token);
    assert.equal(res.status, 400);
    assert.equal(res.body.code, "past");
    assert.equal(rsvpsFor("e").length, 1);
  });
});

describe("the link can't be forged or reused for something else", () => {
  test("a tampered link is rejected", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");
    const [payload, sig] = cancelToken("ana@example.com").split(".");
    const otherId = Buffer.from(JSON.stringify({ id: "someone-else", exp: Date.now() + 60_000 })).toString("base64url");

    assert.equal((await confirm(`${otherId}.${sig}`)).status, 401);
    assert.equal((await confirm(`${payload}.${"A".repeat(sig.length)}`)).status, 401);
    assert.equal((await confirm("garbage")).status, 401);
    assert.equal(rsvpsFor("e").length, 1);
  });

  test("a My Activity link isn't accepted as a cancel link", async () => {
    seedEvent("e");
    await rsvp("e", "ana@example.com");
    await call("POST", "/my-activity", { body: { email: "ana@example.com" } });
    const activityToken = state.emails.at(-1).body.match(/#token=([A-Za-z0-9_.-]+)/)[1];

    assert.equal((await confirm(activityToken)).status, 401);
  });

  test("links expire after 180 days", async () => {
    seedEvent("e", { date: eventDate(400) });
    await rsvp("e", "ana@example.com");
    const token = cancelToken("ana@example.com");

    const realNow = Date.now;
    Date.now = () => realNow() + 181 * 24 * 60 * 60 * 1000;
    try {
      assert.equal((await confirm(token)).status, 401);
    } finally {
      Date.now = realNow;
    }
  });
});
