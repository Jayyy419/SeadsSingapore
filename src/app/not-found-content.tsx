"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

export function NotFoundContent() {
  const { t } = useLocale();

  return (
    <SiteShell title={t.notFoundTitle} subtitle={t.notFoundSubtitle}>
      <div className="section-card flex flex-col items-start gap-4 p-6 sm:p-8">
        <p className="text-sm text-[color:var(--muted)]">{t.tryNavBody}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            {t.backToHomepage}
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[color:var(--foreground-soft)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            {t.contactUsLink}
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
