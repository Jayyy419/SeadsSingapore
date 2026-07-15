"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function updateStory(formData: FormData) {
  const slug = String(formData.get("slug"));
  const categoryEn = String(formData.get("categoryEn") ?? "");
  const titleEn = String(formData.get("titleEn") ?? "");
  const excerptEn = String(formData.get("excerptEn") ?? "");
  const bodyEn = String(formData.get("bodyEn") ?? "");
  const photo = String(formData.get("photo") ?? "");

  const res = await internalApiFetch(`/internal/stories/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify({ categoryEn, titleEn, excerptEn, bodyEn, photo }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update story ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function createStory(formData: FormData) {
  const categoryEn = String(formData.get("categoryEn") ?? "");
  const titleEn = String(formData.get("titleEn") ?? "");
  const excerptEn = String(formData.get("excerptEn") ?? "");
  const bodyEn = String(formData.get("bodyEn") ?? "");
  const photo = String(formData.get("photo") ?? "");

  const res = await internalApiFetch("/internal/stories", {
    method: "POST",
    body: JSON.stringify({ categoryEn, titleEn, excerptEn, bodyEn, photo }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create story: ${res.status}`);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteStory(formData: FormData) {
  const slug = String(formData.get("slug"));

  const res = await internalApiFetch(`/internal/stories/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete story ${slug}: ${res.status}`);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
