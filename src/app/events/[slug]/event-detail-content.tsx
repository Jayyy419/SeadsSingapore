"use client";

import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { useLocale } from "@/lib/locale-context";
import { events } from "@/content/siteContent";

export function EventDetailContent({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  return (
    <SiteShell title={event.title[locale]} subtitle={`${event.type[locale]} · ${event.date} · ${event.location[locale]}`}>
      <div className="space-y-10">
        <article className="section-card space-y-4 p-6 sm:p-8">
          {event.body[locale].map((paragraph, i) => (
            <p key={i} className="text-sm text-[color:var(--muted)]">
              {paragraph}
            </p>
          ))}
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
      </div>
    </SiteShell>
  );
}
