"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

export function DonateContent() {
  const { t } = useLocale();

  return (
    <SiteShell title={t.donatePageTitle} subtitle={t.donatePageSubtitle}>
      <section className="section-card p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{t.comingSoon}</p>
        <h2 className="font-display mt-2 text-3xl">{t.donationsOpeningTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--muted)]">{t.donationsOpeningBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/events"
            className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            {t.joinOurEvents}
          </Link>
          <Link
            href="/partners"
            className="rounded-full border border-[color:var(--foreground-soft)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            {t.partnerWithSeads}
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
