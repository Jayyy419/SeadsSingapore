"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function updateImpactMetric(formData: FormData) {
  const metricId = String(formData.get("metricId"));
  const value = String(formData.get("value") ?? "");
  const order = Number(formData.get("order"));

  // This Lambda handler predates applyLocalized() and takes locale-keyed objects directly —
  // absent keys leave that locale's stored text untouched, same convention as everywhere else.
  const localized = (base: string) =>
    Object.fromEntries(
      (["En", "Zh", "Ms", "Hi"] as const)
        .map((suffix) => [suffix.toLowerCase(), formData.get(`${base}${suffix}`)])
        .filter(([, v]) => typeof v === "string")
    );

  const res = await internalApiFetch(`/internal/impact-metrics/${encodeURIComponent(metricId)}`, {
    method: "PUT",
    body: JSON.stringify({ value, label: localized("label"), note: localized("note"), order }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update metric ${metricId}: ${res.status}`);
  }

  revalidatePath("/admin/impact-metrics");
  revalidatePath("/");
}

export async function createImpactMetric(formData: FormData) {
  const value = String(formData.get("value") ?? "");
  const labelEn = String(formData.get("labelEn") ?? "");
  const noteEn = String(formData.get("noteEn") ?? "");

  const res = await internalApiFetch("/internal/impact-metrics", {
    method: "POST",
    body: JSON.stringify({ value, labelEn, noteEn }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create metric: ${res.status}`);
  }

  revalidatePath("/admin/impact-metrics");
  revalidatePath("/");
}

export async function deleteImpactMetric(formData: FormData) {
  const metricId = String(formData.get("metricId"));

  const res = await internalApiFetch(`/internal/impact-metrics/${encodeURIComponent(metricId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete metric ${metricId}: ${res.status}`);
  }

  revalidatePath("/admin/impact-metrics");
  revalidatePath("/");
}
