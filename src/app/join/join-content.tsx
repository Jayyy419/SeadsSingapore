"use client";

import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { useLocale } from "@/lib/locale-context";

export function JoinContent() {
  const { t } = useLocale();
  const steps = [t.joinStep1, t.joinStep2, t.joinStep3];

  return (
    <SiteShell title={t.joinPageTitle} subtitle={t.joinPageSubtitle}>
      <div className="space-y-10">
        <section className="section-card p-6">
          <h2 className="font-display text-2xl">{t.howItWorks}</h2>
          <ol className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            {steps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </section>

        <InterestForm heading={t.startJourney} body={t.startJourneyBody} />
      </div>
    </SiteShell>
  );
}
