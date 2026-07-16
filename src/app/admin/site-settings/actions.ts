"use server";

import { revalidatePath } from "next/cache";
import { internalApiFetch } from "@/lib/internal-api";

async function updateConfig(configId: "donate" | "social" | "announcement", body: Record<string, unknown>, publicPath: string) {
  const res = await internalApiFetch(`/internal/site-content/config/${configId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to update ${configId} settings: ${res.status}`);
  }

  revalidatePath("/admin/site-settings");
  revalidatePath(publicPath);
}

export async function updateDonateConfig(formData: FormData) {
  await updateConfig(
    "donate",
    {
      enabled: formData.get("enabled") === "on",
      qrImage: String(formData.get("qrImage") ?? ""),
      payNowId: String(formData.get("payNowId") ?? ""),
      instructions: String(formData.get("instructions") ?? ""),
    },
    "/donate"
  );
}

export async function updateSocialConfig(formData: FormData) {
  await updateConfig(
    "social",
    {
      instagram: String(formData.get("instagram") ?? ""),
      tiktok: String(formData.get("tiktok") ?? ""),
      linkedin: String(formData.get("linkedin") ?? ""),
      facebook: String(formData.get("facebook") ?? ""),
      youtube: String(formData.get("youtube") ?? ""),
    },
    "/"
  );
}

export async function updateAnnouncementConfig(formData: FormData) {
  await updateConfig(
    "announcement",
    {
      enabled: formData.get("enabled") === "on",
      message: String(formData.get("message") ?? ""),
      linkUrl: String(formData.get("linkUrl") ?? ""),
      linkLabel: String(formData.get("linkLabel") ?? ""),
    },
    "/"
  );
}
