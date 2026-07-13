"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { events } from "@/content/siteContent";

export function EventsContent() {
  const { locale, t } = useLocale();

  return (
    <SiteShell title={t.eventsPageTitle} subtitle={t.eventsPageSubtitle}>
      <section className="grid gap-4 lg:grid-cols-3">
        {events.map((event) => (
          <article key={event.slug} className="section-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{event.type[locale]}</p>
            <h2 className="font-display mt-2 text-xl">{event.title[locale]}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{event.date}</p>
            <p className="text-sm text-[color:var(--muted)]">{event.location[locale]}</p>
            <Link
              href={`/events/${event.slug}`}
              className="mt-4 inline-block rounded-full bg-[color:var(--inverse-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--inverse-fg)] hover:opacity-85"
            >
              {t.viewDetailsRsvp}
            </Link>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
