"use client";

import { useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("error");
      setErrorMsg("Must be a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setErrorMsg("Image must be under 5MB.");
      return;
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
