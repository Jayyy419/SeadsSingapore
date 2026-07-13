import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { stories } from "@/content/siteContent";

export function generateStaticParams() {
  return stories.map((story) => ({ slug: story.slug }));
}

function getStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return {};
  return { title: story.title, description: story.excerpt };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  return (
    <SiteShell title={story.title} subtitle={story.excerpt}>
      <article className="section-card space-y-4 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.category}</p>
        {story.body.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-[color:var(--muted)]">
            {paragraph}
          </p>
        ))}
      </article>
      <Link href="/blog" className="mt-6 inline-block text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
        &larr; Back to all stories
      </Link>
    </SiteShell>
  );
}
