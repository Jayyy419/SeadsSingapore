"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function createFaqItem(formData: FormData) {
  const res = await internalApiFetch("/internal/site-content/faq", {
    method: "POST",
    body: JSON.stringify({
      question: String(formData.get("question") ?? ""),
      answer: String(formData.get("answer") ?? ""),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create FAQ item: ${res.status}`);
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function updateFaqItem(formData: FormData) {
  const id = String(formData.get("id"));
  const res = await internalApiFetch(`/internal/site-content/faq/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      question: String(formData.get("question") ?? ""),
      answer: String(formData.get("answer") ?? ""),
      order: Number(formData.get("order")),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update FAQ item ${id}: ${res.status}`);
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function deleteFaqItem(formData: FormData) {
  const id = String(formData.get("id"));
  const res = await internalApiFetch(`/internal/site-content/faq/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete FAQ item ${id}: ${res.status}`);
  }

  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}
