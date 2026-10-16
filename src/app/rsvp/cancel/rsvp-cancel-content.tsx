"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import type { LocalizedString } from "@/content/siteContent";

type Rsvp = {
  name: string;
  rsvpStatus: "confirmed" | "waitlisted" | null;
  eventSlug: string;
  eventTitle: LocalizedString | null;
  eventDate: string | null;
  past: boolean;
};

type Status = "loading" | "ready" | "cancelling" | "done" | "gone" | "invalid" | "past" | "noLink" | "tooMany" | "error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";
const CANCEL_ENDPOINT = `${API_BASE_URL}/rsvp/cancel`;

// Reached from the signed link in every RSVP email. Opening it only shows what would be
// cancelled; the button press does the cancelling. Mail security scanners open links in emails
// automatically, and a link that cancelled on open would cancel RSVPs nobody meant to cancel.
// The token travels in the URL fragment (never sent to a server or in a Referer) and is
// stripped from the address bar once read — same handling as the My activity link.
export function RsvpCancelContent() {
  const { locale, t } = useLocale();
  const [status, setStatus] = useState<Status>("loading");
  const [rsvp, setRsvp] = useState<Rsvp | null>(null);
  // Kept in a ref: the effect strips the token from the URL, so a re-run must not re-read it.
  const tokenRef = useRef<string | null | undefined>(undefined);

  async function post(body: Record<string, unknown>) {
    const res = await fetch(CANCEL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tokenRef.current, ...body }),
    });
    const data = await res.json().catch(() => null);
    return { res, data };
  }

  function statusFor(res: Response, data: { code?: string } | null): Status | null {
    if (res.status === 401) return "invalid";
    if (res.status === 404) return "gone";
    if (res.status === 429) return "tooMany";
    if (data?.code === "past") return "past";
    return res.ok ? null : "error";
  }

  useEffect(() => {
    if (tokenRef.current === undefined) {
      tokenRef.current = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (tokenRef.current) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (!tokenRef.current) {
      setStatus("noLink");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { res, data } = await post({});
        if (cancelled) return;
        const failed = statusFor(res, data);
        if (failed) return setStatus(failed);
        setRsvp(data.rsvp);
        setStatus(data.rsvp.past ? "past" : "ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function confirmCancel() {
    setStatus("cancelling");
    try {
      const { res, data } = await post({ confirm: true });
      setStatus(statusFor(res, data) ?? "done");
    } catch {
      setStatus("error");
    }
  }

  const waitlisted = rsvp?.rsvpStatus === "waitlisted";
  const message: Partial<Record<Status, { text: string; tone: "ok" | "warn" }>> = {
    done: { text: t.rsvpCancelDone, tone: "ok" },
    gone: { text: t.rsvpCancelGone, tone: "ok" },
    invalid: { text: t.rsvpCancelInvalid, tone: "warn" },
    past: { text: t.rsvpCancelPast, tone: "warn" },
    noLink: { text: t.rsvpCancelNoLink, tone: "warn" },
    tooMany: { text: t.myActivityTooMany, tone: "warn" },
    error: { text: t.statusError, tone: "warn" },
  };
  const notice = message[status];

  return (
    <SiteShell title={t.rsvpCancelTitle} subtitle={t.rsvpCancelSubtitle}>
      <div className="mx-auto max-w-xl" aria-live="polite">
        {status === "loading" && <p className="text-sm text-[color:var(--muted)]">{t.rsvpCancelLoading}</p>}

        {rsvp && (status === "ready" || status === "cancelling") && (
          <div className="section-card space-y-4 p-6">
            <p className="text-sm text-[color:var(--muted)]">{waitlisted ? t.rsvpCancelWaitlistLead : t.rsvpCancelConfirmLead}</p>
            <div>
              <p className="font-display text-xl text-[color:var(--foreground)]">{rsvp.eventTitle?.[locale] ?? rsvp.eventTitle?.en ?? rsvp.eventSlug}</p>
              {rsvp.eventDate && <p className="text-sm text-[color:var(--muted)]">{rsvp.eventDate}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={confirmCancel}
                disabled={status === "cancelling"}
                className="rounded-full bg-[#c96a3a] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {status === "cancelling" ? "…" : waitlisted ? t.rsvpLeaveWaitlistButton : t.rsvpCancelButton}
              </button>
              <Link
                href={`/events/${rsvp.eventSlug}`}
                className="text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]"
              >
                {t.rsvpCancelKeep}
              </Link>
            </div>
          </div>
        )}

        {notice && (
          <p
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              notice.tone === "ok" ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]" : "bg-[#e2965f]/10 text-[#e2965f]"
            }`}
          >
            {notice.text}
          </p>
        )}

        {(status === "done" || status === "gone" || status === "past") && (
          <Link href="/events" className="mt-6 inline-block text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
            &larr; {t.backToEvents}
          </Link>
        )}
      </div>
    </SiteShell>
  );
}
