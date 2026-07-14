"use client";

import { useActionState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { changePassword, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = { status: "idle" };

export default function AdminSettingsPage() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <AdminShell title="Settings" subtitle="Change the shared admin password.">
      <form action={formAction} className="section-card flex max-w-md flex-col gap-3 p-6 sm:p-8">
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
    </AdminShell>
  );
}
