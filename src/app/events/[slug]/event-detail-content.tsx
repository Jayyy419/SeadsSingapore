"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { useLocale } from "@/lib/locale-context";
import { buildEventIcsDataUrl } from "@/lib/ics";
import { eventCapacityLabel, isEventFull } from "@/lib/event-capacity";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { useEventRsvpCounts } from "@/lib/use-event-rsvp-counts";
import { useEvents } from "@/lib/use-events";

export function EventDetailContent({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const { events, loaded } = useEvents();
  const rsvpCounts = useEventRsvpCounts();
  const event = events.find((e) => e.slug === slug);
  // Wait for the live fetch before 404ing — a newly admin-created event won't be in the
  // static fallback useEvents() starts with, so a slug "not found" against just the fallback
  // doesn't mean it doesn't really exist.
  if (!event && loaded) notFound();
  if (!event) return null;

  const icsUrl = buildEventIcsDataUrl({
    title: event.title[locale],
    description: event.body[locale].join("\n\n"),
    location: event.location[locale],
    date: event.date,
  });
  const capacityLabel = eventCapacityLabel(event, t, rsvpCounts[event.slug]);
  const full = isEventFull(event, rsvpCounts[event.slug]);
  const cancelled = event.status === "cancelled";
  const postponed = event.status === "postponed";

  return (
    <SiteShell title={event.title[locale]} subtitle={`${event.type[locale]} · ${event.date} · ${event.location[locale]}`}>
      <div className="space-y-10">
        {(cancelled || postponed) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              cancelled ? "border-[#e2965f] bg-[#e2965f]/10 text-[#e2965f]" : "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
            }`}
          >
            {cancelled ? t.eventCancelledBody : t.eventPostponedBody}
          </div>
        )}
        <article className="section-card space-y-4 p-6 sm:p-8">
          {capacityLabel && (
            <p className={`text-xs font-semibold uppercase tracking-wide ${full ? "text-[#e2965f]" : "text-[color:var(--accent)]"}`}>
              {capacityLabel}
            </p>
          )}
          {event.body[locale].map((paragraph, i) => (
            <p key={i} className="text-sm text-[color:var(--muted)]">
              {paragraph}
            </p>
          ))}
          <div className="flex flex-wrap gap-3">
            {icsUrl && (
              <a
                href={icsUrl}
                download={`${event.slug}.ics`}
                className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                {t.addToCalendar}
              </a>
            )}
            <a
              href={buildWhatsAppLink(`${full ? t.joinWaitlist : t.rsvpLabel}: ${event.title[locale]} (${event.date})`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              {t.rsvpViaWhatsApp}
            </a>
            <a
              href={`/events/${event.slug}/qr`}
              download={`${event.slug}-qr.png`}
              className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              {t.downloadQrCode}
            </a>
          </div>
        </article>

        {/* No RSVP form for a cancelled event — accepting signups for something that isn't
            happening would just create cleanup work and confused attendees. Postponed events
            keep the form (the event still exists, a new date is coming). */}
        {!cancelled && (
          <InterestForm
            eyebrow={full ? t.waitlistLabel : t.rsvpLabel}
            heading={`${t.joinUsAtPrefix}${event.title[locale]}`}
            body={t.rsvpFormBody}
            interestPlaceholder={t.anythingElseOptional}
            submitLabel={full ? t.joinWaitlist : t.rsvpLabel}
            prefillInterest={`${full ? t.joinWaitlist : t.rsvpLabel}: ${event.title[locale]} (${event.date})`}
            prefillInterestType="event"
            eventSlug={event.slug}
          />
        )}

        <Link href="/events" className="inline-block text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
          &larr; {t.backToEvents}
        </Link>
      </div>
    </SiteShell>
  );
}
