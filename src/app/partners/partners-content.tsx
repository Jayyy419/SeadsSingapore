"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

export function PartnersContent() {
  const { t } = useLocale();
  const partnerTracks = [
    { title: t.partnerTrack1Title, detail: t.partnerTrack1Detail },
    { title: t.partnerTrack2Title, detail: t.partnerTrack2Detail },
    { title: t.partnerTrack3Title, detail: t.partnerTrack3Detail },
  ];

  return (
    <SiteShell title={t.partnersPageTitle} subtitle={t.partnersPageSubtitle}>
      <section className="grid gap-4 lg:grid-cols-3">
        {partnerTracks.map((track) => (
          <article key={track.title} className="section-card p-6">
            <h2 className="font-display text-xl">{track.title}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{track.detail}</p>
          </article>
        ))}
      </section>

      <div className="section-card mt-4 flex flex-col items-center gap-3 p-8 text-center">
        <h2 className="font-display text-2xl">{t.readyToPartner}</h2>
        <p className="max-w-lg text-sm text-[color:var(--muted)]">{t.readyToPartnerBody}</p>
        <Link
          href="/join"
          className="mt-1 rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
        >
          {t.becomePartner}
        </Link>
      </div>
    </SiteShell>
  );
}
