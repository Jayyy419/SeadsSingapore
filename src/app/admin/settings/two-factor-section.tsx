"use client";

import QRCode from "qrcode";
import { useActionState, useEffect, useState } from "react";
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  startTwoFactorSetup,
  type DisableTwoFactorState,
  type EnableTwoFactorState,
  type TwoFactorStatus,
} from "./actions";

const inputClass = "mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm";
const codeInputProps = { inputMode: "numeric", autoComplete: "one-time-code", maxLength: 9, required: true } as const;

// Settings → Two-factor sign-in: set up (scan, confirm with a code, save the backup codes) or
// turn off (password + a code). The secret is shown only during setup; afterwards it exists
// only encrypted in the Lambda's config table.
export function TwoFactorSection() {
  const [status, setStatus] = useState<TwoFactorStatus | "loading">("loading");
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [enableState, enableAction, enablePending] = useActionState(enableTwoFactor, { status: "idle" } as EnableTwoFactorState);
  const [disableState, disableAction, disablePending] = useActionState(disableTwoFactor, { status: "idle" } as DisableTwoFactorState);

  useEffect(() => {
    getTwoFactorStatus().then(setStatus);
  }, [enableState.status, disableState.status]);

  async function beginSetup() {
    setSetupError(null);
    const result = await startTwoFactorSetup();
    if ("error" in result) return setSetupError(result.error);
    setSetup({ secret: result.secret, qr: await QRCode.toDataURL(result.otpauthUri, { margin: 1, width: 200 }) });
  }

  return (
    <section className="section-card mt-6 flex max-w-md flex-col gap-3 p-6 sm:p-8" aria-labelledby="two-factor-heading">
      <h2 id="two-factor-heading" className="font-display text-lg text-[color:var(--foreground)]">
        Two-factor sign-in
      </h2>
      <p className="text-xs text-[color:var(--muted)]">
        Signing in also asks for a 6-digit code from an authenticator app (Google Authenticator, 1Password, Authy…), so a
        leaked password alone isn&apos;t enough.
      </p>

      {status === "loading" && <p className="text-xs text-[color:var(--muted)]">…</p>}

      {enableState.status === "ok" && enableState.backupCodes && (
        <div className="rounded-xl border border-[color:var(--brand)] p-4">
          <p className="text-sm font-semibold text-[color:var(--brand)]">Two-factor sign-in is on.</p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Save these backup codes somewhere safe — each signs you in once if you lose your phone. They won&apos;t be shown
            again.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-1 font-mono text-sm text-[color:var(--foreground)]" aria-label="Backup codes">
            {enableState.backupCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      )}

      {status && status !== "loading" && status.enabled && (
        <>
          <p className="text-sm text-[color:var(--foreground)]">
            <span className="font-semibold text-[color:var(--brand)]">On.</span> {status.backupCodesLeft} backup code
            {status.backupCodesLeft === 1 ? "" : "s"} left.
          </p>
          <form action={disableAction} className="flex flex-col gap-3 border-t border-[color:var(--foreground-soft)] pt-3">
            <p className="text-xs text-[color:var(--muted)]">To turn it off, confirm with the password and a current code.</p>
            <label className="text-sm text-[color:var(--foreground)]">
              Password
              <input type="password" name="password" required className={inputClass} />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Code
              <input name="code" {...codeInputProps} className={inputClass} />
            </label>
            {disableState.status === "error" && <p className="text-xs font-semibold text-[#e2965f]">{disableState.message}</p>}
            <button
              type="submit"
              disabled={disablePending}
              className="self-start rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] disabled:opacity-60"
            >
              {disablePending ? "..." : "Turn off two-factor sign-in"}
            </button>
          </form>
        </>
      )}

      {status && status !== "loading" && !status.enabled && (
        <>
          {disableState.status === "ok" && <p className="text-xs font-semibold text-[color:var(--brand)]">{disableState.message}</p>}
          {!setup ? (
            <button
              type="button"
              onClick={beginSetup}
              className="self-start rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
            >
              Set up two-factor sign-in
            </button>
          ) : (
            <form action={enableAction} className="flex flex-col gap-3">
              <p className="text-xs text-[color:var(--muted)]">1. Scan this with your authenticator app.</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, nothing for next/image to optimise */}
              <img src={setup.qr} alt="QR code for your authenticator app" width={200} height={200} className="rounded-lg bg-white p-2" />
              <p className="text-xs text-[color:var(--muted)]">
                Can&apos;t scan? Enter this key instead: <code className="break-all font-mono text-[color:var(--foreground)]">{setup.secret}</code>
              </p>
              <label className="text-sm text-[color:var(--foreground)]">
                2. Enter the 6-digit code it shows
                <input name="code" {...codeInputProps} className={inputClass} />
              </label>
              {enableState.status === "error" && <p className="text-xs font-semibold text-[#e2965f]">{enableState.message}</p>}
              <button
                type="submit"
                disabled={enablePending}
                className="self-start rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)] disabled:opacity-60"
              >
                {enablePending ? "..." : "Turn on"}
              </button>
            </form>
          )}
          {setupError && <p className="text-xs font-semibold text-[#e2965f]">{setupError}</p>}
        </>
      )}
    </section>
  );
}
