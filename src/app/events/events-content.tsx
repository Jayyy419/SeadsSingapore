"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { events } from "@/content/siteContent";
import { eventCapacityLabel, isEventFull } from "@/lib/event-capacity";
import { useEventRsvpCounts } from "@/lib/use-event-rsvp-counts";

export function EventsContent() {
  const { locale, t } = useLocale();
  const rsvpCounts = useEventRsvpCounts();

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
      <section className="grid gap-4 lg:grid-cols-3">
        {events.map((event) => {
          const capacityLabel = eventCapacityLabel(event, t, rsvpCounts[event.slug]);
          const full = isEventFull(event, rsvpCounts[event.slug]);
          return (
            <article key={event.slug} className="section-card p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{event.type[locale]}</p>
              <h2 className="font-display mt-2 text-xl">{event.title[locale]}</h2>
              <p className="mt-3 text-sm text-[color:var(--muted)]">{event.date}</p>
              <p className="text-sm text-[color:var(--muted)]">{event.location[locale]}</p>
              {capacityLabel && (
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
        })}
      </section>
    </SiteShell>
  );
}
