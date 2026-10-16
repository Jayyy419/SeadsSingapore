import { test, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { call, state, resetState, seed, TABLES, seedAdminAndLogin, eventDate } from "./harness.mjs";

// The harness sets NOTIFY_EMAIL (the team inbox) to team@example.org and SENDER_EMAIL (the
// no-reply From) to no-reply@example.org.
const FROM = "Seads Singapore <no-reply@example.org>";
const INBOX = "team@example.org";

beforeEach(() => resetState());

const submit = (body) => call("POST", "/submit-interest", { body: { name: "Ana", turnstileToken: "ok", ...body } });
const mailTo = (address) => state.emails.filter((e) => e.to[0] === address);

describe("mail comes from the no-reply sender, and replies reach a person", () => {
  test("a visitor's confirmation is from no-reply, and replying goes to the team inbox", async () => {
    await submit({ email: "ana@example.com", interestType: "volunteer" });

    const [confirmation] = mailTo("ana@example.com");
    assert.equal(confirmation.from, FROM);
    assert.deepEqual(confirmation.replyTo, [INBOX]);
  });

  test("the team's notification lands in the inbox, and replying answers the visitor", async () => {
    await submit({ email: "ana@example.com", interestType: "volunteer" });

    const [notification] = mailTo(INBOX);
    assert.match(notification.subject, /New Seads interest form submission/);
    assert.equal(notification.from, FROM);
    assert.deepEqual(notification.replyTo, ["ana@example.com"]);
  });

  test("story submissions notify the inbox with the author as Reply-To", async () => {
    await call("POST", "/submit-story", {
      body: { authorName: "Bo", authorEmail: "bo@example.com", title: "My day", body: "It was good.", turnstileToken: "ok" },
    });

    const [notification] = mailTo(INBOX);
    assert.match(notification.subject, /story submission/);
    assert.deepEqual(notification.replyTo, ["bo@example.com"]);
  });

  test("a waitlist promotion's \"just reply to let us know\" reaches the inbox", async () => {
    const token = await seedAdminAndLogin();
    seed(TABLES.EVENTS_TABLE, { slug: "full", title: { en: "Cleanup" }, date: eventDate(5), location: { en: "Park" }, capacity: 1, rsvpCount: 1 });
    seed(TABLES.TABLE_NAME, { id: "a", name: "A", email: "a@example.com", interestType: "event", eventSlug: "full", rsvpStatus: "confirmed", submittedAt: "2026-01-01" });
    seed(TABLES.TABLE_NAME, { id: "w", name: "W", email: "w@example.com", interestType: "event", eventSlug: "full", rsvpStatus: "waitlisted", submittedAt: "2026-01-02" });

    await call("DELETE", "/internal/submissions/a", { token });

    const [promotion] = mailTo("w@example.com");
    assert.match(promotion.body, /just reply/);
    assert.equal(promotion.from, FROM);
    assert.deepEqual(promotion.replyTo, [INBOX]);
  });
});

describe("addresses that would break an email header are refused", () => {
  for (const email of ["ana@example.com,eve@example.com", "Ana <ana@example.com>", '"ana"@example.com', "ana;x@example.com"]) {
    test(`rejects ${email}`, async () => {
      assert.equal((await submit({ email, interestType: "volunteer" })).status, 400);
      assert.equal(state.emails.length, 0);
    });
  }

  test("ordinary addresses, apostrophes and plus-tags included, are accepted", async () => {
    for (const email of ["o'brien@example.com", "first.last+seads@mail.example.org"]) {
      assert.equal((await submit({ email, interestType: "volunteer" })).status, 200, email);
    }
  });
});
