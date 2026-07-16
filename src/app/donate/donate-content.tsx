"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { useSiteContent } from "@/lib/use-site-content";

// Shows the real PayNow donation details once the admin has configured and enabled them in
// /admin/site-settings — until then it keeps the original "donations opening soon" card, so
// enabling donations is an admin-panel toggle, not a deploy.
export function DonateContent() {
  const { t } = useLocale();
  const { donate } = useSiteContent();
  const [copied, setCopied] = useState(false);

  const payNowReady = donate?.enabled && (donate.qrImage || donate.payNowId);

  return (
    <SiteShell title={t.donatePageTitle} subtitle={t.donatePageSubtitle}>
      {payNowReady ? (
        <section className="section-card mx-auto max-w-xl p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">PayNow</p>
          <h2 className="font-display mt-2 text-3xl">{t.donatePayNowTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[color:var(--muted)]">{t.donatePayNowBody}</p>
          {donate.qrImage && (
            <div className="relative mx-auto mt-6 h-64 w-64 overflow-hidden rounded-2xl border border-[color:var(--foreground-soft)] bg-white">
              <Image src={donate.qrImage} alt="PayNow QR code" fill sizes="256px" className="object-contain p-2" />
            </div>
          )}
          {donate.payNowId && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <code className="rounded-lg bg-[color:var(--surface-2)] px-3 py-1.5 text-base font-semibold text-[color:var(--foreground)]">
                {donate.payNowId}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(donate.payNowId ?? "").then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="rounded-full border border-[color:var(--foreground-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                {copied ? t.copiedLabel : t.copyLabel}
              </button>
            </div>
          )}
          {donate.instructions && <p className="mx-auto mt-5 max-w-md text-sm text-[color:var(--muted)]">{donate.instructions}</p>}
        </section>
      ) : (
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
      )}
    </SiteShell>
  );
}
