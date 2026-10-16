"use client";

import Link from "next/link";
import Image from "next/image";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { usePartners } from "@/lib/use-partners";

export function PartnersContent() {
  const { t } = useLocale();
  const { partners } = usePartners();
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

      {partners.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display mb-4 text-2xl">{t.ourPartnersHeading}</h2>
          <div className="flex flex-wrap items-center gap-6">
            {partners.map((partner) => {
              const logo = partner.logo ? (
                // Fixed nominal width/height (used for next/image's optimization/aspect-ratio
                // math, not the rendered size) since logos have unknown, varying aspect ratios
                // — className overrides the actual display size, same as a plain <img>.
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={160}
                  height={56}
                  className="h-14 w-auto max-w-[160px] object-contain grayscale hover:grayscale-0"
                />
              ) : (
                <span className="text-sm font-semibold text-[color:var(--foreground)]">{partner.name}</span>
              );
              return partner.website ? (
                <a key={partner.slug} href={partner.website} target="_blank" rel="noopener noreferrer" title={partner.name}>
                  {logo}
                </a>
              ) : (
                <span key={partner.slug} title={partner.name}>
                  {logo}
                </span>
              );
            })}
          </div>
        </section>
      )}

      <div className="section-card mt-10 flex flex-col items-center gap-3 p-8 text-center">
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
