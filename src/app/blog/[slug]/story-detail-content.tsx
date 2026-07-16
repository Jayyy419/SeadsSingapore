"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { ShareButtons } from "@/components/share-buttons";
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
          <div className="relative h-48 w-full overflow-hidden rounded-xl">
            <Image src={story.photo} alt={story.title[locale]} fill sizes="(min-width: 640px) 640px, 100vw" className="object-cover" priority />
          </div>
        )}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.category[locale]}</p>
          {story.updatedAt && (
            <p className="text-xs text-[color:var(--muted)]">
              {t.updatedLabel}{" "}
              {new Date(story.updatedAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>
        {story.body[locale].map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-[color:var(--muted)]">
            {paragraph}
          </p>
        ))}
        <ShareButtons title={story.title[locale]} />
      </article>
      <Link href="/blog" className="mt-6 inline-block text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
        &larr; {t.backToStories}
      </Link>
    </SiteShell>
  );
}
