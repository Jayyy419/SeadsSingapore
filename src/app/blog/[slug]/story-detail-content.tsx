"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { useStories } from "@/lib/use-stories";

export function StoryDetailContent({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const { stories, loaded } = useStories();
  const story = stories.find((s) => s.slug === slug);
  // Wait for the live fetch before 404ing — see event-detail-content.tsx for why.
  if (!story && loaded) notFound();
  if (!story) return null;

  return (
    <SiteShell title={story.title[locale]} subtitle={story.excerpt[locale]}>
      <article className="section-card space-y-4 p-6 sm:p-8">
        {story.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.photo} alt={story.title[locale]} className="h-48 w-full rounded-xl object-cover" />
        )}
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
