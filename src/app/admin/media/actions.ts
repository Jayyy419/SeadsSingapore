"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

// Media items are id-keyed (media#<uuid>) — the path segment is just the uuid part, the
// Lambda re-prefixes it. See handleCreateSiteItem/handleUpdateSiteItem in index.mjs.

export async function createMediaItem(formData: FormData) {
  const res = await internalApiFetch("/internal/site-content/media", {
    method: "POST",
    body: JSON.stringify({
      src: String(formData.get("src") ?? ""),
      caption: String(formData.get("caption") ?? ""),
      category: String(formData.get("category") ?? ""),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create media item: ${res.status}`);
  }

  revalidatePath("/admin/media");
  revalidatePath("/media");
}

export async function updateMediaItem(formData: FormData) {
  const id = String(formData.get("id"));
  const res = await internalApiFetch(`/internal/site-content/media/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      src: String(formData.get("src") ?? ""),
      caption: String(formData.get("caption") ?? ""),
      category: String(formData.get("category") ?? ""),
      order: Number(formData.get("order")),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update media item ${id}: ${res.status}`);
  }

  revalidatePath("/admin/media");
  revalidatePath("/media");
}

export async function deleteMediaItem(formData: FormData) {
  const id = String(formData.get("id"));
  const res = await internalApiFetch(`/internal/site-content/media/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete media item ${id}: ${res.status}`);
  }

  revalidatePath("/admin/media");
  revalidatePath("/media");
}
