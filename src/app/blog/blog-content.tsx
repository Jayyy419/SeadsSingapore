"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { useStories } from "@/lib/use-stories";

type CommunityStory = { id: string; authorName: string; title: string; body: string; submittedAt: string };

// English-only by design — community submitters aren't asked to provide 4-language
// translations, unlike the fully-localized admin-authored stories from useStories(). Shown
// inline (no separate detail page) since there's no slug/route for these, just a DynamoDB id.
function useCommunityStories(): CommunityStory[] {
  const [communityStories, setCommunityStories] = useState<CommunityStory[]>([]);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) return;

    let cancelled = false;
    fetch(`${baseUrl}/community-stories`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.stories) setCommunityStories(data.stories);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return communityStories;
}

export function BlogContent() {
  const { locale, t } = useLocale();
  const { stories } = useStories();
  const communityStories = useCommunityStories();

  return (
    <SiteShell title={t.blogPageTitle} subtitle={t.blogPageSubtitle}>
      <div className="mb-4 flex justify-end">
        <Link
          href="/blog/submit"
          className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
        >
          {t.submitYourStory}
        </Link>
      </div>
      <section className="grid gap-4">
        {stories.map((story) => (
          <Link
            key={story.slug}
            href={`/blog/${story.slug}`}
            className="section-card block p-6 text-inherit transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-[0_10px_26px_rgba(31,41,55,.08)]"
          >
            {story.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.photo} alt={story.title[locale]} className="mb-3 h-32 w-full rounded-lg object-cover" />
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.category[locale]}</p>
            <h2 className="font-display mt-2 text-2xl">{story.title[locale]}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{story.excerpt[locale]}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand)]">{t.readStory} &rarr;</span>
          </Link>
        ))}
        {communityStories.map((story) => (
          <article key={story.id} className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{t.communityStoryBadge}</p>
            <h2 className="font-display mt-2 text-2xl">{story.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[color:var(--muted)]">{story.body}</p>
            <p className="mt-4 text-xs text-[color:var(--muted)]">— {story.authorName}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
