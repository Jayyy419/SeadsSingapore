"use client";

import Script from "next/script";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

// Email-only signup that stores into the same submissions pipeline as the interest form
// (interestType "newsletter"), so subscribers show up in /admin/submissions and its CSV
// export with zero new storage. Turnstile is required by the backend (it fails closed on a
// missing token when the secret is configured), so the widget renders here too. Note: on a
// page with multiple Turnstile widgets, window.turnstile.reset() without an id resets the
// first one — a second subscribe attempt in the same visit may need a page refresh, which is
// an acceptable trade for not maintaining widget ids across two unrelated components.
export function NewsletterSignup() {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(formData: FormData) {
    const endpoint = process.env.NEXT_PUBLIC_INTEREST_FORM_ENDPOINT;
    if (!endpoint) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          interestType: "newsletter",
          turnstileToken: formData.get("cf-turnstile-response"),
        }),
      });
      if (!response.ok) throw new Error("Subscribe failed");
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      window.turnstile?.reset();
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--footer-muted)]">{t.newsletterTitle}</p>
      {status === "done" ? (
        <p aria-live="polite" className="mt-2 text-[13px] font-semibold text-[color:var(--footer-fg)]">
          {t.newsletterDone}
        </p>
      ) : (
        <form action={onSubmit} className="mt-2 flex max-w-xs flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder={t.newsletterEmailPh}
              aria-label={t.newsletterEmailPh}
              className="w-full min-w-0 rounded-full border border-white/20 bg-white/[.06] px-4 py-2 text-[13px] text-[color:var(--footer-fg)] placeholder:text-[color:var(--footer-muted)]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-full bg-[color:var(--accent)] px-4 py-2 text-[13px] font-semibold text-white hover:opacity-85 disabled:opacity-60"
            >
              {status === "loading" ? "..." : t.newsletterButton}
            </button>
          </div>
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-theme="dark" data-size="flexible" />
          )}
          {status === "error" && (
            <p aria-live="polite" className="text-xs font-semibold text-[#e2965f]">
              {t.statusError}
            </p>
          )}
        </form>
      )}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      )}
    </div>
  );
}
