import { test, beforeEach, describe } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { call, resetState, getItem, TABLES, seedAdminAndLogin } from "./harness.mjs";

// An independent RFC 6238 implementation, so these tests check codes an authenticator app
// would really show rather than the Lambda agreeing with itself.
function base32Decode(str) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const ch of str) bits += alphabet.indexOf(ch).toString(2).padStart(5, "0");
  return Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
}
function totp(secret, at = Date.now()) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(Math.floor(at / 1000 / 30)));
  const mac = createHmac("sha1", base32Decode(secret)).update(msg).digest();
  const offset = mac[mac.length - 1] & 15;
  return String((mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

// Runs fn with the clock moved forward, as if the admin came back to log in later.
async function later(seconds, fn) {
  const realNow = Date.now;
  Date.now = () => realNow() + seconds * 1000;
  try {
    return await fn();
  } finally {
    Date.now = realNow;
  }
}

const PASSWORD = "correct horse battery staple";
const login = (body) => call("POST", "/admin-login", { body: { password: PASSWORD, ...body } });

let token;
beforeEach(async () => {
  resetState();
  token = await seedAdminAndLogin(PASSWORD);
});

async function enable() {
  const setup = await call("POST", "/internal/2fa/setup", { token });
  const res = await call("POST", "/internal/2fa/enable", { token, body: { code: totp(setup.body.secret) } });
  assert.equal(res.status, 200);
  token = res.body.token;
  return { secret: setup.body.secret, backupCodes: res.body.backupCodes };
}

describe("turning two-factor sign-in on", () => {
  test("it's off by default, and the password alone signs in", async () => {
    assert.deepEqual((await call("GET", "/internal/2fa", { token })).body, { enabled: false, backupCodesLeft: 0 });
    assert.equal((await login()).status, 200);
  });

  test("setup gives a secret and an otpauth link for the QR code, but changes nothing yet", async () => {
    const setup = await call("POST", "/internal/2fa/setup", { token });
    assert.match(setup.body.secret, /^[A-Z2-7]{32}$/);
    assert.match(setup.body.otpauthUri, /^otpauth:\/\/totp\/Seads%20Admin\?secret=[A-Z2-7]{32}&issuer=Seads%20Admin/);
    assert.equal((await login()).status, 200, "still password-only until confirmed");
  });

  test("a wrong confirmation code doesn't turn it on", async () => {
    await call("POST", "/internal/2fa/setup", { token });
    const res = await call("POST", "/internal/2fa/enable", { token, body: { code: "000000" } });
    assert.equal(res.status, 400);
    assert.equal((await call("GET", "/internal/2fa", { token })).body.enabled, false);
  });

  test("confirming turns it on, hands out 8 backup codes, and signs out other sessions", async () => {
    const otherSession = token;
    const { backupCodes } = await enable();

    assert.equal(backupCodes.length, 8);
    assert.match(backupCodes[0], /^[a-z2-7]{4}-[a-z2-7]{4}$/);
    assert.deepEqual((await call("GET", "/internal/2fa", { token })).body, { enabled: true, backupCodesLeft: 8 });
    assert.equal((await call("GET", "/internal/impact-metrics", { token: otherSession })).status, 401);
    assert.equal((await call("GET", "/internal/impact-metrics", { token })).status, 200, "the enabling session stays in");
  });

  test("the secret isn't stored in the clear, and backup codes only as hashes", async () => {
    const { secret, backupCodes } = await enable();
    const stored = JSON.stringify(getItem(TABLES.ADMIN_CONFIG_TABLE, "totp"));
    assert.ok(!stored.includes(secret));
    for (const code of backupCodes) assert.ok(!stored.includes(code));
  });
});

describe("signing in with it on", () => {
  test("the password alone now asks for a code", async () => {
    await enable();
    const res = await login();
    assert.equal(res.status, 401);
    assert.equal(res.body.code, "totp_required");
  });

  test("a wrong code is refused; the current one works", async () => {
    const { secret } = await enable();
    await later(60, async () => {
      assert.equal((await login({ code: "123456" })).body.code, "totp_invalid");
      assert.equal((await login({ code: totp(secret) })).status, 200);
    });
  });

  test("a code can't be reused, even within its 30 seconds", async () => {
    const { secret } = await enable();
    await later(60, async () => {
      const code = totp(secret);
      assert.equal((await login({ code })).status, 200);
      assert.equal((await login({ code })).status, 401);
    });
  });

  test("the code is only asked for after the password checks out", async () => {
    const { secret } = await enable();
    await later(60, async () => {
      const res = await call("POST", "/admin-login", { body: { password: "wrong", code: totp(secret) } });
      assert.equal(res.status, 401);
      assert.equal(res.body.code, undefined);
    });
  });

  test("each backup code works exactly once", async () => {
    const { backupCodes } = await enable();
    assert.equal((await login({ code: backupCodes[0] })).status, 200);
    assert.equal((await login({ code: backupCodes[0] })).status, 401);
    assert.equal((await login({ code: backupCodes[1].toUpperCase() })).status, 200, "case-insensitive");
    assert.equal((await call("GET", "/internal/2fa", { token })).body.backupCodesLeft, 6);
  });

  test("changing the password leaves two-factor on", async () => {
    await enable();
    const res = await call("PATCH", "/internal/admin-password", { token, body: { currentPassword: PASSWORD, newPassword: "a new password 123" } });
    assert.equal(res.status, 200);
    assert.equal((await call("POST", "/admin-login", { body: { password: "a new password 123" } })).body.code, "totp_required");
  });
});

describe("turning it off", () => {
  test("needs the password and a code — a session alone can't strip it", async () => {
    const { secret } = await enable();
    await later(60, async () => {
      assert.equal((await call("POST", "/internal/2fa/disable", { token, body: { password: PASSWORD } })).status, 401);
      assert.equal((await call("POST", "/internal/2fa/disable", { token, body: { password: "wrong", code: totp(secret) } })).status, 401);
      assert.equal((await call("POST", "/internal/2fa/disable", { token, body: { password: PASSWORD, code: totp(secret) } })).status, 200);
    });
    assert.equal((await login()).status, 200, "password-only again");
  });

  test("setup is refused while it's on", async () => {
    await enable();
    assert.equal((await call("POST", "/internal/2fa/setup", { token })).status, 409);
  });

  test("every 2FA endpoint needs a signed-in session", async () => {
    for (const [method, path] of [["GET", "/internal/2fa"], ["POST", "/internal/2fa/setup"], ["POST", "/internal/2fa/enable"], ["POST", "/internal/2fa/disable"]]) {
      assert.equal((await call(method, path, {})).status, 401, path);
    }
  });
});
