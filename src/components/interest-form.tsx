"use client";

import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    turnstile?: { reset: (widgetId?: string) => void };
  }
}

const INTEREST_TYPES = [
  { value: "", label: "I'm interested in..." },
  { value: "volunteer", label: "Volunteering" },
  { value: "partner", label: "Partnering with Seads" },
  { value: "event", label: "Attending an event" },
  { value: "other", label: "Something else" },
] as const;

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
  prefillInterestType?: (typeof INTEREST_TYPES)[number]["value"];
};

export function InterestForm({
  eyebrow = "Get Involved",
  heading = "Join The Movement",
  body = "Whether you want to volunteer, partner, or just learn more — tell us a bit about yourself and we'll follow up.",
  namePlaceholder = "Your name",
  emailPlaceholder = "Your email",
  interestPlaceholder = "Tell us more (optional)",
  submitLabel = "Submit",
  prefillInterest,
  prefillInterestType,
}: InterestFormProps) {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "done" | "error" | "unconfigured">("idle");

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
        <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9db3a3]">{eyebrow}</p>
        <h2 className="font-display mb-4 text-3xl text-white sm:text-4xl">{heading}</h2>
        <p className="mx-auto mb-9 max-w-[560px] text-base text-[#c9d2cd]">{body}</p>
        <form className="mx-auto grid gap-3 text-left md:grid-cols-2" action={onInterestSubmit}>
          <input
            type="text"
            name="name"
            placeholder={namePlaceholder}
            aria-label={namePlaceholder}
            required
            className="rounded-xl border border-white/20 bg-white/[.06] px-4 py-3.5 text-sm text-white placeholder:text-white/50"
          />
          <input
            type="email"
            name="email"
            placeholder={emailPlaceholder}
            aria-label={emailPlaceholder}
            required
            className="rounded-xl border border-white/20 bg-white/[.06] px-4 py-3.5 text-sm text-white placeholder:text-white/50"
          />
          <select
            name="interestType"
            defaultValue={prefillInterestType ?? ""}
            aria-label="What are you interested in"
            className="rounded-xl border border-white/20 bg-white/[.06] px-4 py-3.5 text-sm text-white md:col-span-2 [&>option]:text-[color:var(--foreground)]"
          >
            {INTEREST_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="interest"
            placeholder={interestPlaceholder}
            aria-label={interestPlaceholder}
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
              <p className="text-xs font-semibold text-[color:var(--brand-soft)] md:col-span-2">
                Submission captured. Thanks for reaching out — we&rsquo;ll follow up soon.
              </p>
            )}
            {submitStatus === "error" && (
              <p className="text-xs font-semibold text-[#e2965f] md:col-span-2">Could not submit right now. Please try again.</p>
            )}
            {submitStatus === "unconfigured" && (
              <p className="text-xs font-semibold text-[#e2965f] md:col-span-2">
                This form isn&rsquo;t connected yet — please email us directly at hello@seads.sg for now.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitStatus === "loading"}
            className="mt-2 w-fit justify-self-center rounded-full bg-[color:var(--accent)] px-8 py-3.5 text-sm font-semibold text-white hover:opacity-85 disabled:opacity-60 md:col-span-2"
          >
            {submitStatus === "loading" ? "Submitting..." : submitLabel}
          </button>
        </form>
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
        )}
      </div>
    </div>
  );
}
