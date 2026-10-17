import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { invoke, state, resetState, seed, TABLES, eventDate } from "./harness.mjs";

beforeEach(() => resetState());

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const sub = (id, extra) => seed(TABLES.TABLE_NAME, { id, name: `P ${id}`, email: `${id}@example.com`, submittedAt: daysAgo(1), ...extra });
const run = () => invoke({ task: "weekly-digest" });
const digest = () => state.emails.find((e) => /weekly digest/.test(e.subject));

test("summarises the week's submissions by type, ignoring older ones", async () => {
  sub("a", { interestType: "volunteer" });
  sub("b", { interestType: "volunteer" });
  sub("c", { interestType: "newsletter" });
  sub("old", { interestType: "partner", submittedAt: daysAgo(10) });

  await run();

  const mail = digest();
  assert.deepEqual(mail.to, ["team@example.org"]);
  assert.match(mail.subject, /3 new/);
  assert.match(mail.body, /New submissions: 3/);
  assert.match(mail.body, /Volunteering: 2/);
  assert.match(mail.body, /Newsletter signup: 1/);
  assert.doesNotMatch(mail.body, /Partnering/);
});

test("lists the next fortnight's events with how full they are", async () => {
  seed(TABLES.EVENTS_TABLE, { slug: "soon", title: { en: "Beach Cleanup" }, date: eventDate(3), capacity: 2 });
  seed(TABLES.EVENTS_TABLE, { slug: "later", title: { en: "Far Off" }, date: eventDate(30) });
  seed(TABLES.EVENTS_TABLE, { slug: "off", title: { en: "Called Off" }, date: eventDate(5), status: "cancelled" });
  sub("r1", { interestType: "event", eventSlug: "soon", rsvpStatus: "confirmed", submittedAt: daysAgo(20) });
  sub("r2", { interestType: "event", eventSlug: "soon", rsvpStatus: "confirmed" });
  sub("w1", { interestType: "event", eventSlug: "soon", rsvpStatus: "waitlisted" });

  await run();

  const body = digest().body;
  assert.match(body, new RegExp(`${eventDate(3)} — Beach Cleanup: 2/2 confirmed, 1 waitlisted`));
  assert.doesNotMatch(body, /Far Off|Called Off/);
});

test("flags stories waiting for moderation and self-cancellations", async () => {
  seed(TABLES.STORY_SUBMISSIONS_TABLE, { id: "s1", status: "pending" });
  seed(TABLES.STORY_SUBMISSIONS_TABLE, { id: "s2", status: "approved" });
  seed(TABLES.AUDIT_LOG_TABLE, { id: "l1", action: "cancel", entityType: "rsvp", timestamp: daysAgo(2) });
  seed(TABLES.AUDIT_LOG_TABLE, { id: "l2", action: "cancel", entityType: "rsvp", timestamp: daysAgo(12) });

  await run();

  const body = digest().body;
  assert.match(body, /Stories waiting for moderation: 1 — https:\/\/seads\.test\/admin\/stories/);
  assert.match(body, /RSVPs cancelled by attendees: 1/);
});

test("a quiet week still sends, and says so", async () => {
  await run();
  assert.match(digest().body, /New submissions: 0/);
  assert.match(digest().body, /\(no events scheduled\)/);
});

test("rate-limit counters stored in the submissions table aren't counted as submissions", async () => {
  seed(TABLES.TABLE_NAME, { id: "ratelimit#ip#1.2.3.4#123", count: 3, submittedAt: daysAgo(1) });
  await run();
  assert.match(digest().body, /New submissions: 0/);
});
