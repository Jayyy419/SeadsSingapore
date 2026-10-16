import { test, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { call, state, resetState, seed, getItem, allItems, TABLES, seedAdminAndLogin, eventDate } from "./harness.mjs";

beforeEach(() => resetState());

const rsvp = (eventSlug, email, extra = {}) =>
  call("POST", "/submit-interest", {
    body: { name: "Test Person", email, interestType: "event", eventSlug, turnstileToken: "ok", ...extra },
  });

const seedEvent = (slug, overrides = {}) =>
  seed(TABLES.EVENTS_TABLE, {
    slug,
    title: { en: "Beach Cleanup" },
    date: eventDate(7),
    location: { en: "East Coast Park" },
    capacity: 10,
    ...overrides,
  });

const tokenFromEmail = (email) => email.body.match(/#token=([A-Za-z0-9_.-]+)/)?.[1];

// ---------------------------------------------------------------------------------------------
describe("my-activity is verified by email, not open to anyone who knows an address", () => {
  beforeEach(() => {
    seed(TABLES.TABLE_NAME, { id: "s1", email: "Alice@Example.com", interestType: "volunteer", submittedAt: "2026-01-01T00:00:00Z" });
    seed(TABLES.TABLE_NAME, { id: "s2", email: "bob@example.com", interestType: "partner", submittedAt: "2026-01-02T00:00:00Z" });
  });

  test("requesting a link never returns activity, and answers identically for unknown addresses", async () => {
    const known = await call("POST", "/my-activity", { body: { email: "alice@example.com" } });
    const unknown = await call("POST", "/my-activity", { body: { email: "nobody@example.com" } });

    assert.equal(known.status, 200);
    assert.deepEqual(known, unknown, "a different response would reveal whether an address has activity");
    assert.equal(known.body.activity, undefined);
  });

  test("a link is emailed only to an address that has activity", async () => {
    await call("POST", "/my-activity", { body: { email: "alice@example.com" } });
    await call("POST", "/my-activity", { body: { email: "nobody@example.com" } });

    assert.equal(state.emails.length, 1);
    assert.deepEqual(state.emails[0].to, ["alice@example.com"]);
    assert.match(state.emails[0].body, /https:\/\/seads\.test\/my-activity#token=/);
  });

  test("the emailed token returns that address's activity and nobody else's", async () => {
    await call("POST", "/my-activity", { body: { email: "alice@example.com" } });
    const res = await call("POST", "/my-activity", { body: { token: tokenFromEmail(state.emails[0]) } });

    assert.equal(res.status, 200);
    assert.equal(res.body.email, "alice@example.com");
    assert.equal(res.body.activity.length, 1);
    assert.equal(res.body.activity[0].interestType, "volunteer");
  });

  test("a tampered signature is rejected", async () => {
    await call("POST", "/my-activity", { body: { email: "alice@example.com" } });
    const token = tokenFromEmail(state.emails[0]);
    const flipped = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");

    const res = await call("POST", "/my-activity", { body: { token: flipped } });
    assert.equal(res.status, 401);
  });

  test("swapping in another address while keeping the signature is rejected", async () => {
    await call("POST", "/my-activity", { body: { email: "alice@example.com" } });
    const [, signature] = tokenFromEmail(state.emails[0]).split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ email: "bob@example.com", exp: Date.now() + 60_000 })).toString("base64url");

    const res = await call("POST", "/my-activity", { body: { token: `${forgedPayload}.${signature}` } });
    assert.equal(res.status, 401);
  });

  test("a link stops working after 30 minutes", async () => {
    await call("POST", "/my-activity", { body: { email: "alice@example.com" } });
    const token = tokenFromEmail(state.emails[0]);

    const realNow = Date.now;
    Date.now = () => realNow() + 31 * 60 * 1000;
    try {
      const res = await call("POST", "/my-activity", { body: { token } });
      assert.equal(res.status, 401);
      assert.equal(res.body.code, "invalid_token");
    } finally {
      Date.now = realNow;
    }
  });

  test("an admin session token is not accepted as an activity link", async () => {
    const adminToken = await seedAdminAndLogin();
    const res = await call("POST", "/my-activity", { body: { token: adminToken } });
    assert.equal(res.status, 401);
  });

  test("one address can't be used to flood an inbox", async () => {
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await call("POST", "/my-activity", { body: { email: "alice@example.com" } }));

    assert.deepEqual(results.map((r) => r.status), [200, 200, 200, 429, 429]);
    assert.equal(state.emails.length, 3);
  });
});

// ---------------------------------------------------------------------------------------------
describe("RSVPs can't be used to exhaust an event's capacity", () => {
  test("repeat RSVPs from one address claim only one slot, and the reply doesn't reveal it", async () => {
    seedEvent("cleanup");
    const first = await rsvp("cleanup", "carol@example.com");
    const second = await rsvp("cleanup", "CAROL@example.com");

    assert.deepEqual(first, second, "a different reply would reveal who is attending");
    assert.equal(getItem(TABLES.EVENTS_TABLE, "cleanup").rsvpCount, 1);
    assert.equal(allItems(TABLES.TABLE_NAME).filter((i) => i.eventSlug === "cleanup").length, 1);
    assert.match(state.emails.at(-1).subject, /already registered/i);
    assert.deepEqual(state.emails.at(-1).to, ["CAROL@example.com"]);
  });

  test("cancelled events refuse RSVPs", async () => {
    seedEvent("off", { status: "cancelled" });

    assert.equal((await rsvp("off", "d@example.com")).status, 400);
    assert.equal(getItem(TABLES.EVENTS_TABLE, "off").rsvpCount, undefined);
  });

  // The event page keeps its RSVP form open for a postponed event ("a new date will be
  // announced"); the API refusing them meant every one of those visitors got an error.
  test("postponed events still take RSVPs, and the confirmation doesn't quote the old date", async () => {
    seedEvent("later", { status: "postponed", date: "18 Jul 2099" });

    assert.equal((await rsvp("later", "d@example.com")).status, 200);
    assert.equal(getItem(TABLES.EVENTS_TABLE, "later").rsvpCount, 1);
    const confirmation = state.emails.find((e) => e.to[0] === "d@example.com");
    assert.ok(confirmation, "the RSVP is confirmed by email");
    assert.doesNotMatch(confirmation.body, /18 Jul 2099/);
    assert.match(confirmation.body, /Postponed — new date to be announced/);
  });

  test("past events refuse RSVPs, but an event happening today still accepts them", async () => {
    seedEvent("yesterday", { date: eventDate(-1) });
    seedEvent("today", { date: eventDate(0) });

    assert.equal((await rsvp("yesterday", "e@example.com")).status, 400);
    assert.equal((await rsvp("today", "e@example.com")).status, 200);
  });

  test("an unparseable date doesn't close RSVPs (it's listed as upcoming on the site)", async () => {
    seedEvent("tbc", { date: "sometime in spring" });
    assert.equal((await rsvp("tbc", "f@example.com")).status, 200);
  });

  test("an RSVP for an event that doesn't exist is refused rather than silently waitlisted", async () => {
    const res = await rsvp("no-such-event", "g@example.com");
    assert.equal(res.status, 400);
    assert.equal(allItems(TABLES.TABLE_NAME).filter((i) => i.eventSlug).length, 0);
  });

  test("anything carrying an eventSlug is stored as an RSVP, so it can't hide from the roster", async () => {
    seedEvent("cleanup");
    await rsvp("cleanup", "h@example.com", { interestType: "volunteer" });
    const stored = allItems(TABLES.TABLE_NAME).find((i) => i.eventSlug === "cleanup");
    assert.equal(stored.interestType, "event");
  });

  test("capacity is still enforced atomically: the slot after the last goes to the waitlist", async () => {
    seedEvent("tiny", { capacity: 1 });
    await rsvp("tiny", "first@example.com");
    await rsvp("tiny", "second@example.com");

    const byEmail = Object.fromEntries(allItems(TABLES.TABLE_NAME).filter((i) => i.eventSlug === "tiny").map((i) => [i.email, i.rsvpStatus]));
    assert.deepEqual(byEmail, { "first@example.com": "confirmed", "second@example.com": "waitlisted" });
    assert.equal(getItem(TABLES.EVENTS_TABLE, "tiny").rsvpCount, 1);
  });
});

// ---------------------------------------------------------------------------------------------
describe("submitter-facing emails can't be used as a phishing relay", () => {
  const confirmationFor = async (name) => {
    resetState();
    await call("POST", "/submit-interest", { body: { name, email: "victim@example.com", interestType: "volunteer", turnstileToken: "ok" } });
    return state.emails.find((e) => e.to[0] === "victim@example.com").body.split("\n")[0];
  };

  test("links and domains are stripped from the greeting", async () => {
    assert.equal(await confirmationFor("Claim your prize at https://evil.example/win now"), "Hi Claim your prize at now,");
    assert.equal(await confirmationFor("evil.com"), "Hi there,");
    assert.equal(await confirmationFor("Go to www.bad-site.co/x"), "Hi Go to,");
    assert.equal(await confirmationFor("write to me@attacker.io"), "Hi write to,");
  });

  test("line breaks can't forge extra paragraphs", async () => {
    const greeting = await confirmationFor("Sam\n\nYour account is suspended");
    assert.equal(greeting, "Hi Sam Your account is suspended,");
  });

  test("ordinary names are left alone", async () => {
    assert.equal(await confirmationFor("Mary-Jane O'Neil"), "Hi Mary-Jane O'Neil,");
    assert.equal(await confirmationFor("Nur Aisyah binte Ahmad"), "Hi Nur Aisyah binte Ahmad,");
    assert.equal(await confirmationFor("李华"), "Hi 李华,");
  });

  test("the greeting is length-capped", async () => {
    const greeting = await confirmationFor("A".repeat(200));
    assert.equal(greeting, `Hi ${"A".repeat(60)},`);
  });
});

// ---------------------------------------------------------------------------------------------
describe("admin sessions can be revoked", () => {
  const internal = (token) => call("GET", "/internal/impact-metrics", { token });

  test("a freshly issued token works", async () => {
    const token = await seedAdminAndLogin();
    assert.equal((await internal(token)).status, 200);
  });

  test("changing the password signs out every existing session but keeps the changer signed in", async () => {
    const oldToken = await seedAdminAndLogin("old password 123");
    const otherDevice = (await call("POST", "/admin-login", { body: { password: "old password 123" } })).body.token;

    const res = await call("PATCH", "/internal/admin-password", {
      token: oldToken,
      body: { currentPassword: "old password 123", newPassword: "new password 456" },
    });

    assert.equal(res.status, 200);
    assert.equal((await internal(oldToken)).status, 401);
    assert.equal((await internal(otherDevice)).status, 401);
    assert.equal((await internal(res.body.token)).status, 200);
  });

  test("'sign out everywhere' revokes other sessions without changing the password", async () => {
    const mine = await seedAdminAndLogin("pw pw pw pw");
    const theirs = (await call("POST", "/admin-login", { body: { password: "pw pw pw pw" } })).body.token;

    const res = await call("POST", "/internal/sessions/revoke", { token: mine });

    assert.equal(res.status, 200);
    assert.equal((await internal(theirs)).status, 401);
    assert.equal((await internal(res.body.token)).status, 200);
    assert.equal((await call("POST", "/admin-login", { body: { password: "pw pw pw pw" } })).status, 200, "password unchanged");
  });

  test("revoking requires an authenticated session", async () => {
    await seedAdminAndLogin();
    const res = await call("POST", "/internal/sessions/revoke", { token: "1900000000000." + "a".repeat(64) });
    assert.equal(res.status, 401);
  });

  test("one visitor running out of login attempts doesn't lock anyone else out", async () => {
    await seedAdminAndLogin("right password");
    const attempt = (ip, password = "wrong") => call("POST", "/admin-login", { ip, body: { password } });

    for (let i = 0; i < 10; i++) assert.equal((await attempt("198.51.100.7")).status, 401);
    assert.equal((await attempt("198.51.100.7")).status, 429, "the guesser is stopped");
    assert.equal((await attempt("198.51.100.7", "right password")).status, 429, "even with the right password");
    assert.equal((await attempt("198.51.100.8", "right password")).status, 200, "a different visitor still gets in");
  });

  test("the unused /verify-session endpoint is gone", async () => {
    const token = await seedAdminAndLogin();
    assert.equal((await call("POST", "/verify-session", { body: { token } })).status, 404);
  });

  test("tampered, malformed and expired tokens are rejected", async () => {
    const token = await seedAdminAndLogin();
    const [expiresAt, sig] = token.split(".");

    assert.equal((await internal(`${Number(expiresAt) + 1}.${sig}`)).status, 401, "extended expiry");
    assert.equal((await internal(`${expiresAt}.${"0".repeat(64)}`)).status, 401, "wrong signature");
    assert.equal((await internal("not-a-token")).status, 401);
    assert.equal((await internal(undefined)).status, 401);

    const realNow = Date.now;
    Date.now = () => realNow() + 9 * 60 * 60 * 1000;
    try {
      assert.equal((await internal(token)).status, 401, "past its 8h lifetime");
    } finally {
      Date.now = realNow;
    }
  });
});

// ---------------------------------------------------------------------------------------------
describe("story moderation", () => {
  test("a decision on an unknown id 404s instead of creating a ghost record", async () => {
    const token = await seedAdminAndLogin();
    const res = await call("PATCH", "/internal/story-submissions/does-not-exist", { token, body: { status: "approved" } });

    assert.equal(res.status, 404);
    assert.equal(getItem(TABLES.STORY_SUBMISSIONS_TABLE, "does-not-exist"), undefined);
  });

  test("approving emails the author — this never worked before, the role can't GetItem this table", async () => {
    const token = await seedAdminAndLogin();
    seed(TABLES.STORY_SUBMISSIONS_TABLE, {
      id: "st1",
      authorName: "Priya",
      authorEmail: "priya@example.com",
      title: "My first cleanup",
      body: "It was great.",
      status: "pending",
      submittedAt: "2026-01-01T00:00:00Z",
    });

    const res = await call("PATCH", "/internal/story-submissions/st1", { token, body: { status: "approved" } });

    assert.equal(res.status, 200);
    assert.equal(getItem(TABLES.STORY_SUBMISSIONS_TABLE, "st1").status, "approved");
    const mail = state.emails.find((e) => e.to[0] === "priya@example.com");
    assert.ok(mail, "decision email sent");
    assert.match(mail.body, /^Hi Priya,/);
    assert.match(mail.body, /"My first cleanup"/);
  });

  test("re-sending the same decision doesn't email the author twice", async () => {
    const token = await seedAdminAndLogin();
    seed(TABLES.STORY_SUBMISSIONS_TABLE, { id: "st2", authorName: "Ken", authorEmail: "ken@example.com", title: "T", status: "pending", submittedAt: "x" });

    await call("PATCH", "/internal/story-submissions/st2", { token, body: { status: "rejected" } });
    await call("PATCH", "/internal/story-submissions/st2", { token, body: { status: "rejected" } });

    assert.equal(state.emails.filter((e) => e.to[0] === "ken@example.com").length, 1);
  });

  test("a phishing payload in a story title doesn't reach the author's inbox", async () => {
    const token = await seedAdminAndLogin();
    seed(TABLES.STORY_SUBMISSIONS_TABLE, {
      id: "st3",
      authorName: "Victim",
      authorEmail: "victim@example.com",
      title: "Reset your password at https://evil.example/reset",
      status: "pending",
      submittedAt: "x",
    });

    await call("PATCH", "/internal/story-submissions/st3", { token, body: { status: "rejected" } });

    const mail = state.emails.find((e) => e.to[0] === "victim@example.com");
    assert.doesNotMatch(mail.body, /evil\.example/);
  });
});
