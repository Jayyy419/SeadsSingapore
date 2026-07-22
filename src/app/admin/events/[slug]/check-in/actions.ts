"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function setAttendance(formData: FormData) {
  const id = String(formData.get("id"));
  const slug = String(formData.get("slug"));
  const attended = formData.get("attended") === "true";

  const res = await internalApiFetch(`/internal/submissions/${encodeURIComponent(id)}/attendance`, {
    method: "PATCH",
    body: JSON.stringify({ attended }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update attendance: ${res.status}`);
  }

  revalidatePath(`/admin/events/${encodeURIComponent(slug)}/check-in`);
}
