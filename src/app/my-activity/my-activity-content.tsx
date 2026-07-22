"use client";

import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

type ActivityItem = {
  submittedAt: string;
  interestType: string | null;
  eventSlug: string | null;
  eventTitle: string | null;
  eventDate: string | null;
  rsvpStatus: string | null;
};

// Email-keyed self-service lookup — every RSVP/join/story-interest submission is already
// stored keyed by the email the visitor typed in, so this just filters that same data down to
// one person instead of standing up a whole account system. No login: whoever knows an email
// can see its activity, same trust model as "forward this confirmation email to a friend".
export function MyActivityContent() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const endpoint = process.env.NEXT_PUBLIC_INTEREST_FORM_ENDPOINT;
    if (!endpoint) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`${endpoint.replace(/\/submit-interest$/, "")}/my-activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();
      setActivity(data.activity ?? []);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <SiteShell title={t.myActivityTitle} subtitle={t.myActivitySubtitle}>
      <div className="mx-auto max-w-xl">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.myActivityEmailPh}
            aria-label={t.myActivityEmailPh}
            className="w-full min-w-0 rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)] disabled:opacity-60"
          >
            {status === "loading" ? "…" : t.myActivityButton}
          </button>
        </form>

        {status === "error" && (
          <p aria-live="polite" className="mt-4 text-sm font-semibold text-[#e2965f]">
            {t.myActivityError}
          </p>
        )}

        {status === "done" && (
          <div aria-live="polite" className="mt-6 space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-[color:var(--muted)]">{t.myActivityEmpty}</p>
            ) : (
              activity.map((item, i) => (
                <div key={i} className="section-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">
                    {item.interestType || "—"}
                    {item.rsvpStatus && (
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          item.rsvpStatus === "confirmed"
                            ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                            : "bg-[#e2965f]/15 text-[#e2965f]"
                        }`}
                      >
                        {item.rsvpStatus}
                      </span>
                    )}
                  </p>
                  {item.eventTitle && (
                    <p className="mt-1 font-display text-lg text-[color:var(--foreground)]">
                      {item.eventTitle}
                      {item.eventDate && <span className="ml-2 text-sm font-normal text-[color:var(--muted)]">· {item.eventDate}</span>}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{new Date(item.submittedAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
