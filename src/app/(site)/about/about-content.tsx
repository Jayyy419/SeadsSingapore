"use client";

import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

export function AboutContent() {
  const { t } = useLocale();

  return (
    <SiteShell title={t.aboutPageTitle} subtitle={t.aboutPageSubtitle}>
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-card p-6 lg:col-span-2">
          <h2 className="font-display text-2xl">{t.missionHeading}</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{t.missionBody}</p>
          <h3 className="font-display mt-6 text-xl">{t.visionHeading}</h3>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{t.visionBody}</p>
        </article>

        <article className="section-card p-6">
          <h2 className="font-display text-xl">{t.valuesHeading}</h2>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
            <li>{t.valueYouthAgency}</li>
            <li>{t.valueCommunityTrust}</li>
            <li>{t.valueActionOverNoise}</li>
            <li>{t.valueMeasurableOutcomes}</li>
          </ul>
        </article>
      </section>
    </SiteShell>
  );
}
