"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { useLocale } from "@/lib/locale-context";
import { events } from "@/content/siteContent";
import { buildEventIcsDataUrl } from "@/lib/ics";

export function EventDetailContent({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  const icsUrl = buildEventIcsDataUrl({
    title: event.title[locale],
    description: event.body[locale].join("\n\n"),
    location: event.location[locale],
    date: event.date,
  });

  return (
    <SiteShell title={event.title[locale]} subtitle={`${event.type[locale]} · ${event.date} · ${event.location[locale]}`}>
      <div className="space-y-10">
        <article className="section-card space-y-4 p-6 sm:p-8">
          {event.body[locale].map((paragraph, i) => (
            <p key={i} className="text-sm text-[color:var(--muted)]">
              {paragraph}
            </p>
          ))}
          {icsUrl && (
            <a
              href={icsUrl}
              download={`${event.slug}.ics`}
              className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              {t.addToCalendar}
            </a>
          )}
        </article>

        <InterestForm
          eyebrow={t.rsvpLabel}
          heading={`${t.joinUsAtPrefix}${event.title[locale]}`}
          body={t.rsvpFormBody}
          interestPlaceholder={t.anythingElseOptional}
          submitLabel={t.rsvpLabel}
          prefillInterest={`${t.rsvpLabel}: ${event.title[locale]} (${event.date})`}
          prefillInterestType="event"
        />

        <Link href="/events" className="inline-block text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
          &larr; {t.backToEvents}
        </Link>
      </div>
    </SiteShell>
  );
}
