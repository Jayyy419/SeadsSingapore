"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function deleteSubmission(formData: FormData) {
  const id = String(formData.get("id"));

  const res = await internalApiFetch(`/internal/submissions/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete submission ${id}: ${res.status}`);
  }

  revalidatePath("/admin/submissions");
}
