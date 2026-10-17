"use server";

import { cookies } from "next/headers";
import { internalApiFetch } from "@/lib/internal-api";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/admin-session";

export type ChangePasswordState = { status: "idle" | "ok" | "error"; message?: string };
export type RevokeSessionsState = { status: "idle" | "ok" | "error"; message?: string };

// Changing the password and "sign out everywhere" both rotate the Lambda's session epoch, which
// invalidates every outstanding token — including the one this browser is holding. The Lambda
// hands back a fresh token for the caller, so re-issue the cookie with it (same attributes as
// /admin/api/login); without this, changing the password would also log out the person who just
// changed it. A missing token is ignored rather than treated as an error, so this stays correct
// against a Lambda deployed before epochs existed, which doesn't rotate anything.
async function adoptRefreshedToken(token: unknown) {
  if (typeof token !== "string" || !token) return;
  (await cookies()).set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function changePassword(_prevState: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { status: "error", message: "New password and confirmation don't match." };
  }

  const res = await internalApiFetch("/internal/admin-password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { status: "error", message: data?.error ?? "Could not change password." };
  }

  await adoptRefreshedToken(data?.token);
  return { status: "ok", message: "Password changed. Every other signed-in session has been signed out." };
}

export async function revokeOtherSessions(): Promise<RevokeSessionsState> {
  const res = await internalApiFetch("/internal/sessions/revoke", { method: "POST" });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return { status: "error", message: data?.error ?? "Could not sign out other sessions." };
  }

  await adoptRefreshedToken(data?.token);
  return { status: "ok", message: "Every other session has been signed out. You're still signed in here." };
}

// Two-factor sign-in. The Lambda does all of it (see the TOTP section of
// backend/interest-form/index.mjs); these just relay, and adopt the fresh session token that
// turning it on hands back — it signs out every other session, as those were opened without it.
export type TwoFactorStatus = { enabled: boolean; backupCodesLeft: number } | null;
export type TwoFactorSetup = { secret: string; otpauthUri: string } | { error: string };
export type EnableTwoFactorState = { status: "idle" | "ok" | "error"; message?: string; backupCodes?: string[] };
export type DisableTwoFactorState = { status: "idle" | "ok" | "error"; message?: string };

export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  const res = await internalApiFetch("/internal/2fa");
  return res.ok ? res.json() : null;
}

export async function startTwoFactorSetup(): Promise<TwoFactorSetup> {
  const res = await internalApiFetch("/internal/2fa/setup", { method: "POST" });
  const data = await res.json().catch(() => null);
  return res.ok ? { secret: data.secret, otpauthUri: data.otpauthUri } : { error: data?.error ?? "Could not start setup." };
}

export async function enableTwoFactor(_prev: EnableTwoFactorState, formData: FormData): Promise<EnableTwoFactorState> {
  const res = await internalApiFetch("/internal/2fa/enable", {
    method: "POST",
    body: JSON.stringify({ code: String(formData.get("code") ?? "") }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { status: "error", message: data?.error ?? "Could not turn on two-factor sign-in." };
  await adoptRefreshedToken(data?.token);
  return { status: "ok", backupCodes: data?.backupCodes ?? [] };
}

export async function disableTwoFactor(_prev: DisableTwoFactorState, formData: FormData): Promise<DisableTwoFactorState> {
  const res = await internalApiFetch("/internal/2fa/disable", {
    method: "POST",
    body: JSON.stringify({ password: String(formData.get("password") ?? ""), code: String(formData.get("code") ?? "") }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { status: "error", message: data?.error ?? "Could not turn off two-factor sign-in." };
  return { status: "ok", message: "Two-factor sign-in is off. The password alone signs in again." };
}
