"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { stories } from "@/content/siteContent";

export function StoryDetailContent({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const story = stories.find((s) => s.slug === slug);
  if (!story) notFound();

  return (
    <SiteShell title={story.title[locale]} subtitle={story.excerpt[locale]}>
      <article className="section-card space-y-4 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.category[locale]}</p>
        {story.body[locale].map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-[color:var(--muted)]">
            {paragraph}
          </p>
        ))}
      </article>
      <Link href="/blog" className="mt-6 inline-block text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
        &larr; {t.backToStories}
      </Link>
    </SiteShell>
  );
}
