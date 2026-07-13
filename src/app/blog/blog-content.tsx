"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { stories } from "@/content/siteContent";

export function BlogContent() {
  const { locale, t } = useLocale();

  return (
    <SiteShell title={t.blogPageTitle} subtitle={t.blogPageSubtitle}>
      <section className="grid gap-4">
        {stories.map((story) => (
          <Link
            key={story.slug}
            href={`/blog/${story.slug}`}
            className="section-card block p-6 text-inherit transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-[0_10px_26px_rgba(31,41,55,.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.category[locale]}</p>
            <h2 className="font-display mt-2 text-2xl">{story.title[locale]}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{story.excerpt[locale]}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand)]">{t.readStory} &rarr;</span>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
