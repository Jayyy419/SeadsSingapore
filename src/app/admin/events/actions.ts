"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

function revalidateEventPaths() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function createEvent(formData: FormData) {
  const titleEn = String(formData.get("titleEn") ?? "");
  const typeEn = String(formData.get("typeEn") ?? "");
  const date = String(formData.get("date") ?? "");
  const locationEn = String(formData.get("locationEn") ?? "");
  const bodyEn = String(formData.get("bodyEn") ?? "");
  const capacity = String(formData.get("capacity") ?? "");

  const res = await internalApiFetch("/internal/events", {
    method: "POST",
    body: JSON.stringify({ titleEn, typeEn, date, locationEn, bodyEn, capacity: capacity || undefined }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Failed to create event: ${res.status}`);
  }

  revalidateEventPaths();
}

export async function updateEvent(formData: FormData) {
  const slug = String(formData.get("slug"));
  const titleEn = String(formData.get("titleEn") ?? "");
  const typeEn = String(formData.get("typeEn") ?? "");
  const date = String(formData.get("date") ?? "");
  const locationEn = String(formData.get("locationEn") ?? "");
  const bodyEn = String(formData.get("bodyEn") ?? "");
  const capacity = formData.get("capacity");

  const res = await internalApiFetch(`/internal/events/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify({ titleEn, typeEn, date, locationEn, bodyEn, capacity: capacity === "" ? "" : capacity }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update event ${slug}: ${res.status}`);
  }

  revalidateEventPaths();
}

export async function deleteEvent(formData: FormData) {
  const slug = String(formData.get("slug"));

  const res = await internalApiFetch(`/internal/events/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete event ${slug}: ${res.status}`);
  }

  revalidateEventPaths();
}
