"use client";

import { useEffect, useRef, useState } from "react";
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

type Status = "idle" | "sending" | "sent" | "loading" | "done" | "expired" | "tooMany" | "error";

// Same public API base and fallback the rest of the site uses (the URL isn't a secret), so this
// works without NEXT_PUBLIC_INTEREST_FORM_ENDPOINT being set — including in the e2e suite.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";
const ACTIVITY_ENDPOINT = `${API_BASE_URL}/my-activity`;

// Two-step, email-verified lookup. Step 1 asks the API to email a signed link to the address
// (the API answers identically whether or not that address has any activity, so this page
// can't be used to discover who volunteers or attends). Step 2 is that link: it lands here with
// the token in the URL *fragment*, which browsers never send to the server — so it stays out of
// access logs and Referer headers — and it's stripped from the address bar as soon as it's read.
//
// This replaced an open lookup that returned anyone's full history to whoever typed their
// email in, with nothing to prove they owned the address.
export function MyActivityContent() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // The token is read from the URL once and kept in a ref, because the effect destroys its own
  // input: it strips the token from the address bar. React may re-run an effect (cleanup then
  // setup again — Strict Mode does this in development, and it's allowed generally), and a re-run
  // that re-read the URL would find nothing after its predecessor's fetch had been cancelled by
  // the cleanup. Keeping the token in a ref, which survives a re-run, makes the effect safe to
  // repeat.
  const tokenRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (tokenRef.current === undefined) {
      tokenRef.current = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (tokenRef.current) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    const token = tokenRef.current;
    if (!token) return;

    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const res = await fetch(ACTIVITY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (cancelled) return;
        if (res.status === 401) return setStatus("expired");
        if (res.status === 429) return setStatus("tooMany");
        if (!res.ok) throw new Error(`Lookup failed: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setActivity(data.activity ?? []);
        setVerifiedEmail(data.email ?? "");
        setStatus("done");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function requestLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(ACTIVITY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) return setStatus("tooMany");
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const showForm = status !== "loading" && status !== "done";
  const notice =
    status === "sent"
      ? { text: t.myActivitySent, tone: "ok" }
      : status === "expired"
        ? { text: t.myActivityLinkExpired, tone: "warn" }
        : status === "tooMany"
          ? { text: t.myActivityTooMany, tone: "warn" }
          : status === "error"
            ? { text: t.myActivityError, tone: "warn" }
            : null;

  return (
    <SiteShell title={t.myActivityTitle} subtitle={t.myActivitySubtitle}>
      <div className="mx-auto max-w-xl">
        {showForm && (
          <form onSubmit={requestLink} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.myActivityEmailPh}
              aria-label={t.myActivityEmailPh}
              autoComplete="email"
              className="w-full min-w-0 rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="shrink-0 rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)] disabled:opacity-60"
            >
              {status === "sending" ? "…" : t.myActivityButton}
            </button>
          </form>
        )}

        <div aria-live="polite">
          {notice && (
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                notice.tone === "ok"
                  ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                  : "bg-[#e2965f]/10 text-[#e2965f]"
              }`}
            >
              {notice.text}
            </p>
          )}

          {status === "loading" && <p className="text-sm text-[color:var(--muted)]">{t.myActivityLoading}</p>}

          {status === "done" && (
            <div className="space-y-3">
              {verifiedEmail && (
                <p className="text-sm text-[color:var(--muted)]">
                  {t.myActivityShowingFor} <span className="font-semibold text-[color:var(--foreground)]">{verifiedEmail}</span>
                </p>
              )}
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
      </div>
    </SiteShell>
  );
}
