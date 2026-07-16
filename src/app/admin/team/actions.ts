"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";
import { collectTranslations } from "@/lib/admin-form";

export async function updateTeamMember(formData: FormData) {
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name") ?? "");
  const roleEn = String(formData.get("roleEn") ?? "");
  const bioEn = String(formData.get("bioEn") ?? "");
  const photo = String(formData.get("photo") ?? "");
  const order = Number(formData.get("order"));

  const res = await internalApiFetch(`/internal/team/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify({ name, roleEn, bioEn, photo, order, ...collectTranslations(formData, ["role", "bio"]) }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update team member ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
}

export async function createTeamMember(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const roleEn = String(formData.get("roleEn") ?? "");
  const bioEn = String(formData.get("bioEn") ?? "");
  const photo = String(formData.get("photo") ?? "");

  const res = await internalApiFetch("/internal/team", {
    method: "POST",
    body: JSON.stringify({ name, roleEn, bioEn, photo }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create team member: ${res.status}`);
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
}

export async function deleteTeamMember(formData: FormData) {
  const slug = String(formData.get("slug"));

  const res = await internalApiFetch(`/internal/team/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete team member ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/team");
  revalidatePath("/team");
}
