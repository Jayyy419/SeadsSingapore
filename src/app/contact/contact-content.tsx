"use client";

import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

export function ContactContent() {
  const { t } = useLocale();

  return (
    <SiteShell title={t.contactPageTitle} subtitle={t.contactPageSubtitle}>
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-card p-6">
          <h2 className="font-display text-xl">{t.generalEnquiries}</h2>
          <a href="mailto:hello@seads.sg" className="mt-3 block text-sm text-[color:var(--muted)] hover:text-[color:var(--brand)]">
            hello@seads.sg
          </a>
        </article>
        <article className="section-card p-6">
          <h2 className="font-display text-xl">{t.partnerships}</h2>
          <a href="mailto:partners@seads.sg" className="mt-3 block text-sm text-[color:var(--muted)] hover:text-[color:var(--brand)]">
            partners@seads.sg
          </a>
        </article>
        <article className="section-card p-6">
          <h2 className="font-display text-xl">{t.mediaEnquiry}</h2>
          <a href="mailto:media@seads.sg" className="mt-3 block text-sm text-[color:var(--muted)] hover:text-[color:var(--brand)]">
            media@seads.sg
          </a>
        </article>
      </section>
    </SiteShell>
  );
}
