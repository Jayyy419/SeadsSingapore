"use client";

import { useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Longest edge after client-side downscaling — far larger than any display size on the site,
// small enough that a modern phone photo (often 12MP+/8MB+) comfortably fits under MAX_BYTES.
const MAX_DIMENSION = 2000;

// Shrinks an oversized photo in the browser (canvas redraw to JPEG) instead of rejecting it —
// previously a typical phone photo just failed with "must be under 5MB" and the admin had to
// find external resizing tooling before they could continue. Animated GIFs are excluded
// (a canvas redraw would freeze them to one frame); an oversized GIF still gets the clear
// error instead.
async function downscaleImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("Could not encode image");
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

// Uploads go browser -> S3 directly via a short-lived presigned URL (see
// /admin/api/upload-url and the Lambda's POST /internal/uploads) — this Lambda/API Gateway
// never sees the file bytes, only issues the one-time permission to PUT them. The resulting
// public URL is carried in a hidden input so the surrounding <form action={serverAction}>
// picks it up on submit like any other field, without this component needing to know
// anything about the entity it's attached to.
export function AdminImageUpload({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("error");
      setErrorMsg("Must be a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      if (file.type === "image/gif") {
        setStatus("error");
        setErrorMsg("GIF must be under 5MB (large GIFs can't be auto-resized without losing animation).");
        return;
      }
      try {
        file = await downscaleImage(file);
      } catch {
        setStatus("error");
        setErrorMsg("Image must be under 5MB (automatic resizing failed).");
        return;
      }
      if (file.size > MAX_BYTES) {
        setStatus("error");
        setErrorMsg("Image is still over 5MB after resizing — please use a smaller photo.");
        return;
      }
    }

    setStatus("uploading");
    setErrorMsg("");
    try {
      const urlRes = await fetch("/admin/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Could not get an upload URL");
      const { uploadUrl, publicUrl } = await urlRes.json();

      const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      setUrl(publicUrl);
      setStatus("idle");
    } catch {
      setStatus("error");
      setErrorMsg("Upload failed — please try again.");
    }
  }

  return (
    <div className="text-sm text-[color:var(--foreground)]">
      {label}
      <div className="mt-1 flex items-center gap-3">
        {/* admin-only preview of a freshly-uploaded S3 object, not a site asset next/image would optimize anyway */}
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-16 rounded-lg border border-[color:var(--foreground-soft)] object-cover" />
        )}
        <div className="flex flex-col gap-1">
          <input
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={onFileChange}
            disabled={status === "uploading"}
            aria-label={label}
            className="text-xs text-[color:var(--muted)] file:mr-2 file:rounded-full file:border file:border-[color:var(--foreground-soft)] file:bg-[color:var(--surface)] file:px-3 file:py-1.5 file:text-xs file:font-semibold"
          />
          {status === "uploading" && <p className="text-xs text-[color:var(--muted)]">Uploading…</p>}
          {status === "error" && <p className="text-xs font-semibold text-[#e2965f]">{errorMsg}</p>}
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="w-fit text-xs font-semibold text-[color:var(--muted)] hover:text-[#e2965f]"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
