"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function updateImpactMetric(formData: FormData) {
  const metricId = String(formData.get("metricId"));
  const value = String(formData.get("value") ?? "");
  const labelEn = String(formData.get("labelEn") ?? "");
  const noteEn = String(formData.get("noteEn") ?? "");

  const res = await internalApiFetch(`/internal/impact-metrics/${encodeURIComponent(metricId)}`, {
    method: "PUT",
    body: JSON.stringify({ value, label: { en: labelEn }, note: { en: noteEn } }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update metric ${metricId}: ${res.status}`);
  }

  revalidatePath("/admin/impact-metrics");
  revalidatePath("/");
}
