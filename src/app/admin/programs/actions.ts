"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function updateProgram(formData: FormData) {
  const slug = String(formData.get("slug"));
  const tagEn = String(formData.get("tagEn") ?? "");
  const nameEn = String(formData.get("nameEn") ?? "");
  const descriptionEn = String(formData.get("descriptionEn") ?? "");
  const whoEn = String(formData.get("whoEn") ?? "");
  const bodyEn = String(formData.get("bodyEn") ?? "");
  const photo = String(formData.get("photo") ?? "");

  const res = await internalApiFetch(`/internal/programs/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify({ tagEn, nameEn, descriptionEn, whoEn, bodyEn, photo }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update program ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

export async function createProgram(formData: FormData) {
  const tagEn = String(formData.get("tagEn") ?? "");
  const nameEn = String(formData.get("nameEn") ?? "");
  const descriptionEn = String(formData.get("descriptionEn") ?? "");
  const whoEn = String(formData.get("whoEn") ?? "");
  const bodyEn = String(formData.get("bodyEn") ?? "");
  const photo = String(formData.get("photo") ?? "");

  const res = await internalApiFetch("/internal/programs", {
    method: "POST",
    body: JSON.stringify({ tagEn, nameEn, descriptionEn, whoEn, bodyEn, photo }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create program: ${res.status}`);
  }

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

export async function deleteProgram(formData: FormData) {
  const slug = String(formData.get("slug"));

  const res = await internalApiFetch(`/internal/programs/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete program ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}
