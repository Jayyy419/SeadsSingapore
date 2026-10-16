"use client";

import { useActionState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { changePassword, revokeOtherSessions, type ChangePasswordState, type RevokeSessionsState } from "./actions";

const initialState: ChangePasswordState = { status: "idle" };
const initialRevokeState: RevokeSessionsState = { status: "idle" };

export default function AdminSettingsPage() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeOtherSessions, initialRevokeState);

  return (
    <AdminShell title="Settings" subtitle="Change the shared admin password and manage signed-in sessions.">
      <form action={formAction} className="section-card flex max-w-md flex-col gap-3 p-6 sm:p-8">
        <h2 className="font-display text-lg text-[color:var(--foreground)]">Change password</h2>
        <p className="text-xs text-[color:var(--muted)]">Changing the password also signs out every other device that&apos;s signed in.</p>
        <label className="text-sm text-[color:var(--foreground)]">
          Current password
          <input
            type="password"
            name="currentPassword"
            required
            className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-[color:var(--foreground)]">
          New password
          <input
            type="password"
            name="newPassword"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-[color:var(--foreground)]">
          Confirm new password
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        {state.status === "ok" && <p className="text-xs font-semibold text-[color:var(--brand)]">{state.message}</p>}
        {state.status === "error" && <p className="text-xs font-semibold text-[#e2965f]">{state.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-1 justify-self-start rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)] disabled:opacity-60"
        >
          {pending ? "..." : "Change password"}
        </button>
      </form>

      <form action={revokeAction} className="section-card mt-6 flex max-w-md flex-col gap-3 p-6 sm:p-8">
        <h2 className="font-display text-lg text-[color:var(--foreground)]">Signed-in sessions</h2>
        <p className="text-xs text-[color:var(--muted)]">
          Lost a laptop, or signed in on a shared computer? This signs out every other session immediately, without changing
          the password. You stay signed in here.
        </p>
        {revokeState.status === "ok" && <p className="text-xs font-semibold text-[color:var(--brand)]">{revokeState.message}</p>}
        {revokeState.status === "error" && <p className="text-xs font-semibold text-[#e2965f]">{revokeState.message}</p>}
        <button
          type="submit"
          disabled={revokePending}
          className="mt-1 self-start rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] disabled:opacity-60"
        >
          {revokePending ? "..." : "Sign out all other sessions"}
        </button>
      </form>
    </AdminShell>
  );
}
