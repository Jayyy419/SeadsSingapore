"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

export async function createTestimonial(formData: FormData) {
  const res = await internalApiFetch("/internal/site-content/testimonial", {
    method: "POST",
    body: JSON.stringify({
      quote: String(formData.get("quote") ?? ""),
      author: String(formData.get("author") ?? ""),
      roleLabel: String(formData.get("roleLabel") ?? ""),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create testimonial: ${res.status}`);
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function updateTestimonial(formData: FormData) {
  const id = String(formData.get("id"));
  const res = await internalApiFetch(`/internal/site-content/testimonial/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      quote: String(formData.get("quote") ?? ""),
      author: String(formData.get("author") ?? ""),
      roleLabel: String(formData.get("roleLabel") ?? ""),
      order: Number(formData.get("order")),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update testimonial ${id}: ${res.status}`);
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(formData: FormData) {
  const id = String(formData.get("id"));
  const res = await internalApiFetch(`/internal/site-content/testimonial/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete testimonial ${id}: ${res.status}`);
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
