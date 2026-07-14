"use client";

import Script from "next/script";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

declare global {
  interface Window {
    turnstile?: { reset: (widgetId?: string) => void };
  }
}

export default function SubmitStoryPage() {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "rateLimited">("idle");

  async function onSubmit(formData: FormData) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const payload = {
        authorName: formData.get("authorName"),
        authorEmail: formData.get("authorEmail"),
        title: formData.get("title"),
        body: formData.get("body"),
        turnstileToken: formData.get("cf-turnstile-response"),
      };

      const response = await fetch(`${baseUrl}/submit-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        setStatus("rateLimited");
        return;
      }
      if (!response.ok) throw new Error("Submission failed");

      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      window.turnstile?.reset();
    }
  }

  return (
    <SiteShell title={t.submitStoryPageTitle} subtitle={t.submitStoryPageSubtitle}>
      <form action={onSubmit} className="section-card grid gap-3 p-6 sm:p-8">
        <input
          type="text"
          name="authorName"
          placeholder={t.yourNamePh}
          aria-label={t.yourNamePh}
          required
          className="rounded-xl border border-[color:var(--foreground-soft)] px-4 py-3.5 text-sm"
        />
        <input
          type="email"
          name="authorEmail"
          placeholder={t.yourEmailPh}
          aria-label={t.yourEmailPh}
          required
          className="rounded-xl border border-[color:var(--foreground-soft)] px-4 py-3.5 text-sm"
        />
        <input
          type="text"
          name="title"
          placeholder={t.storyTitlePh}
          aria-label={t.storyTitlePh}
          required
          className="rounded-xl border border-[color:var(--foreground-soft)] px-4 py-3.5 text-sm"
        />
        <textarea
          name="body"
          placeholder={t.storyBodyPh}
          aria-label={t.storyBodyPh}
          required
          rows={8}
          className="rounded-xl border border-[color:var(--foreground-soft)] px-4 py-3.5 text-sm"
        />
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        )}
        <div aria-live="polite">
          {status === "done" && <p className="text-xs font-semibold text-[color:var(--brand-soft)]">{t.submitStoryStatusDone}</p>}
          {status === "error" && <p className="text-xs font-semibold text-[#e2965f]">{t.statusError}</p>}
          {status === "rateLimited" && <p className="text-xs font-semibold text-[#e2965f]">{t.statusRateLimited}</p>}
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="justify-self-start rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)] disabled:opacity-60"
        >
          {status === "loading" ? "..." : t.submitForReview}
        </button>
      </form>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
    </SiteShell>
  );
}
