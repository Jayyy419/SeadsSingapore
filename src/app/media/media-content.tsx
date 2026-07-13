"use client";

import { SiteShell } from "@/components/site-shell";
import { MediaMasonry } from "@/components/media-masonry";
import { useLocale } from "@/lib/locale-context";

export function MediaContent() {
  const { t } = useLocale();

  return (
    <SiteShell title={t.mediaPageTitle} subtitle={t.mediaPageSubtitle}>
      <section className="section-card bg-[color:var(--surface-2)]/70 p-5 sm:p-7">
        <div className="mb-4">
          <h2 className="font-display text-3xl">{t.photoGallery}</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{t.clickToOpenFullscreen}</p>
        </div>
        <MediaMasonry showFilter />
      </section>
    </SiteShell>
  );
}
