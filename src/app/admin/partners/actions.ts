"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function updatePartner(formData: FormData) {
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name") ?? "");
  const logo = String(formData.get("logo") ?? "");
  const website = String(formData.get("website") ?? "");

  const res = await internalApiFetch(`/internal/partners/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify({ name, logo, website }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update partner ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/partners");
  revalidatePath("/partners");
}

export async function createPartner(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const logo = String(formData.get("logo") ?? "");
  const website = String(formData.get("website") ?? "");

  const res = await internalApiFetch("/internal/partners", {
    method: "POST",
    body: JSON.stringify({ name, logo, website }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create partner: ${res.status}`);
  }

  revalidatePath("/admin/partners");
  revalidatePath("/partners");
}

export async function deletePartner(formData: FormData) {
  const slug = String(formData.get("slug"));

  const res = await internalApiFetch(`/internal/partners/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete partner ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/partners");
  revalidatePath("/partners");
}
