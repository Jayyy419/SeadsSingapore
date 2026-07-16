"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { eventCapacityLabel, isEventFull } from "@/lib/event-capacity";
import { useEventRsvpCounts } from "@/lib/use-event-rsvp-counts";
import { useEvents } from "@/lib/use-events";
import { parseEventDate } from "@/lib/ics";
import type { EventItem } from "@/content/siteContent";
import type { Translation } from "@/content/i18n";

// Splits into upcoming (soonest first) and past (most recent first) — previously the list
// mixed everything sorted oldest-first, so stale past events sat at the top forever and a
// visitor could reasonably conclude the org was inactive. An unparseable date is treated as
// upcoming rather than silently hidden, so a typo'd date is at least still visible.
function splitEvents(events: EventItem[]) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const upcoming: EventItem[] = [];
  const past: EventItem[] = [];
  for (const event of events) {
    const date = parseEventDate(event.date);
    (date && date < today ? past : upcoming).push(event);
  }
  const time = (e: EventItem) => parseEventDate(e.date)?.getTime() ?? 0;
  upcoming.sort((a, b) => time(a) - time(b));
  past.sort((a, b) => time(b) - time(a));
  return { upcoming, past };
}

export function statusBadge(event: EventItem, t: Translation): { label: string; className: string } | null {
  if (event.status === "cancelled") return { label: t.eventCancelledLabel, className: "bg-[#e2965f]/15 text-[#e2965f]" };
  if (event.status === "postponed") return { label: t.eventPostponedLabel, className: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]" };
  return null;
}

export function EventsContent() {
  const { locale, t } = useLocale();
  const rsvpCounts = useEventRsvpCounts();
  const { events, loaded } = useEvents();
  const { upcoming, past } = splitEvents(events);

  const renderCard = (event: EventItem) => {
    const capacityLabel = eventCapacityLabel(event, t, rsvpCounts[event.slug]);
    const full = isEventFull(event, rsvpCounts[event.slug]);
    const badge = statusBadge(event, t);
    return (
      <article key={event.slug} className="section-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{event.type[locale]}</p>
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.className}`}>{badge.label}</span>
          )}
        </div>
        <h2 className={`font-display mt-2 text-xl ${event.status === "cancelled" ? "line-through opacity-70" : ""}`}>
          {event.title[locale]}
        </h2>
        <p className="mt-3 text-sm text-[color:var(--muted)]">{event.date}</p>
        <p className="text-sm text-[color:var(--muted)]">{event.location[locale]}</p>
        {capacityLabel && !badge && (
          <p className={`mt-2 text-xs font-semibold ${full ? "text-[#e2965f]" : "text-[color:var(--muted)]"}`}>{capacityLabel}</p>
        )}
        <Link
          href={`/events/${event.slug}`}
          className="mt-4 inline-block rounded-full bg-[color:var(--inverse-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--inverse-fg)] hover:opacity-85"
        >
          {t.viewDetailsRsvp}
        </Link>
      </article>
    );
  };

  return (
    <SiteShell title={t.eventsPageTitle} subtitle={t.eventsPageSubtitle}>
      <div className="mb-4 flex justify-end">
        <a
          href="/events/calendar.ics"
          className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
        >
          {t.subscribeToCalendar}
        </a>
      </div>

      {upcoming.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-3">{upcoming.map(renderCard)}</section>
      ) : (
        loaded && (
          <div className="section-card p-8 text-center">
            <p className="mx-auto max-w-xl text-sm text-[color:var(--muted)]">{t.noUpcomingEvents}</p>
          </div>
        )
      )}

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display mb-4 text-2xl text-[color:var(--foreground)]">{t.pastEventsTitle}</h2>
          <div className="grid gap-4 opacity-75 lg:grid-cols-3">{past.map(renderCard)}</div>
        </section>
      )}
    </SiteShell>
  );
}
