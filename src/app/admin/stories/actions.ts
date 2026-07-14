"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function reviewStorySubmission(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  const res = await internalApiFetch(`/internal/story-submissions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update story submission ${id}: ${res.status}`);
  }

  revalidatePath("/admin/stories");
  revalidatePath("/blog");
}

export async function deleteStorySubmission(formData: FormData) {
  const id = String(formData.get("id"));

  const res = await internalApiFetch(`/internal/story-submissions/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete story submission ${id}: ${res.status}`);
  }

  revalidatePath("/admin/stories");
  revalidatePath("/blog");
}
