"use server";

import { internalApiFetch } from "@/lib/internal-api";

export type ChangePasswordState = { status: "idle" | "ok" | "error"; message?: string };

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

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { status: "error", message: data?.error ?? "Could not change password." };
  }

  return { status: "ok", message: "Password changed." };
}
