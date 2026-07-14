"use client";

import Script from "next/script";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

declare global {
  interface Window {
    turnstile?: { reset: (widgetId?: string) => void };
  }
}

type InterestType = "" | "volunteer" | "partner" | "event" | "other";

type InterestFormProps = {
  eyebrow?: string;
  heading?: string;
  body?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  interestPlaceholder?: string;
  submitLabel?: string;
  /** Pre-fills the free-text interest field — used when arriving from a specific event/program's "RSVP"/"Apply" link. */
  prefillInterest?: string;
  /** Pre-selects the structured interest-type dropdown to match where someone arrived from. */
  prefillInterestType?: InterestType;
};

export function InterestForm({
  eyebrow,
  heading,
  body,
  namePlaceholder,
  emailPlaceholder,
  interestPlaceholder,
  submitLabel,
  prefillInterest,
  prefillInterestType,
}: InterestFormProps) {
  const { t } = useLocale();
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "done" | "error" | "unconfigured" | "rateLimited">("idle");

  const interestTypes: { value: InterestType; label: string }[] = [
    { value: "", label: t.interestTypeDefault },
    { value: "volunteer", label: t.interestTypeVolunteer },
    { value: "partner", label: t.interestTypePartner },
    { value: "event", label: t.interestTypeEvent },
    { value: "other", label: t.interestTypeOther },
  ];

  async function onInterestSubmit(formData: FormData) {
    const endpoint = process.env.NEXT_PUBLIC_INTEREST_FORM_ENDPOINT;
    if (!endpoint) {
      // Don't claim success when nothing was actually captured — an unconfigured endpoint
      // previously showed the same "Submission captured" message as a real success.
      setSubmitStatus("unconfigured");
      return;
    }

    setSubmitStatus("loading");
    try {
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        interest: formData.get("interest"),
        interestType: formData.get("interestType"),
        turnstileToken: formData.get("cf-turnstile-response"),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        setSubmitStatus("rateLimited");
        return;
      }
      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setSubmitStatus("done");
    } catch {
      setSubmitStatus("error");
    } finally {
      // Turnstile tokens are single-use — reset the widget so a retry gets a fresh one.
      window.turnstile?.reset();
    }
  }

  return (
    <div className="rounded-3xl bg-[color:var(--inverse-bg)] px-4 py-14 text-center sm:px-8">
      <div className="mx-auto max-w-[640px]">
        <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9db3a3]">{eyebrow ?? t.contactEyebrow}</p>
        <h2 className="font-display mb-4 text-3xl text-white sm:text-4xl">{heading ?? t.contactTitle}</h2>
        <p className="mx-auto mb-9 max-w-[560px] text-base text-[#c9d2cd]">{body ?? t.contactBody}</p>
        <form className="mx-auto grid gap-3 text-left md:grid-cols-2" action={onInterestSubmit}>
          <input
            type="text"
            name="name"
            placeholder={namePlaceholder ?? t.namePh}
            aria-label={namePlaceholder ?? t.namePh}
            required
            className="rounded-xl border border-white/20 bg-white/[.06] px-4 py-3.5 text-sm text-white placeholder:text-white/50"
          />
          <input
            type="email"
            name="email"
            placeholder={emailPlaceholder ?? t.emailPh}
            aria-label={emailPlaceholder ?? t.emailPh}
            required
            className="rounded-xl border border-white/20 bg-white/[.06] px-4 py-3.5 text-sm text-white placeholder:text-white/50"
          />
          <select
            name="interestType"
            defaultValue={prefillInterestType ?? ""}
            aria-label={t.interestTypeDefault}
            className="rounded-xl border border-white/20 bg-white/[.06] px-4 py-3.5 text-sm text-white md:col-span-2 [&>option]:text-[color:var(--foreground)]"
          >
            {interestTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="interest"
            placeholder={interestPlaceholder ?? t.interestPh}
            aria-label={interestPlaceholder ?? t.interestPh}
            defaultValue={prefillInterest}
            className="rounded-xl border border-white/20 bg-white/[.06] px-4 py-3.5 text-sm text-white placeholder:text-white/50 md:col-span-2"
          />
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div
              className="cf-turnstile md:col-span-2"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-theme="dark"
            />
          )}
          <div aria-live="polite" className="contents">
            {submitStatus === "done" && (
              <p className="text-xs font-semibold text-[color:var(--brand-soft)] md:col-span-2">{t.statusDone}</p>
            )}
            {submitStatus === "error" && (
              <p className="text-xs font-semibold text-[#e2965f] md:col-span-2">{t.statusError}</p>
            )}
            {submitStatus === "unconfigured" && (
              <p className="text-xs font-semibold text-[#e2965f] md:col-span-2">{t.statusUnconfigured}</p>
            )}
            {submitStatus === "rateLimited" && (
              <p className="text-xs font-semibold text-[#e2965f] md:col-span-2">{t.statusRateLimited}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitStatus === "loading"}
            className="mt-2 w-fit justify-self-center rounded-full bg-[color:var(--accent)] px-8 py-3.5 text-sm font-semibold text-white hover:opacity-85 disabled:opacity-60 md:col-span-2"
          >
            {submitStatus === "loading" ? "..." : (submitLabel ?? t.submit)}
          </button>
        </form>
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
        )}
      </div>
    </div>
  );
}
