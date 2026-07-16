"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { useSiteContent } from "@/lib/use-site-content";

// FAQ entries are admin-created (/admin/faq) — a youth org fields the same questions (age
// ranges, cost, how to volunteer) constantly, and before this page they had no home on the
// site at all. Native <details> keeps it dependency-free and keyboard-accessible.
export function FaqContent() {
  const { t } = useLocale();
  const { faq, loaded } = useSiteContent();

  return (
    <SiteShell title={t.faqTitle} subtitle={t.faqSubtitle}>
      {faq.length > 0 ? (
        <div className="mx-auto max-w-3xl space-y-3">
          {faq.map((item) => (
            <details key={item.itemId} className="section-card group p-0">
              <summary className="cursor-pointer list-none px-6 py-4 font-display text-lg text-[color:var(--foreground)] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block text-[color:var(--brand)] transition-transform group-open:rotate-90">›</span>
                {item.question}
              </summary>
              <div className="border-t border-[color:var(--foreground-soft)] px-6 py-4 text-sm leading-relaxed text-[color:var(--muted)] whitespace-pre-line">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      ) : (
        loaded && (
          <div className="section-card mx-auto max-w-xl p-8 text-center">
            <p className="text-sm text-[color:var(--muted)]">{t.faqEmpty}</p>
            <Link
              href="/contact"
              className="mt-4 inline-block rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
            >
              {t.navContact}
            </Link>
          </div>
        )
      )}
    </SiteShell>
  );
}
