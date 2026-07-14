import type { Metadata } from "next";
import { stories } from "@/content/siteContent";
import { StoryDetailContent } from "./story-detail-content";

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
  return { title: story.title.en, description: story.excerpt.en };
}

// Only fields backed by real story data — no fabricated publish date, since the static seed
// stories don't carry one.
function buildArticleJsonLd(story: NonNullable<ReturnType<typeof getStory>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title.en,
    description: story.excerpt.en,
    articleSection: story.category.en,
    publisher: { "@type": "NonprofitOrganization", name: "Seads Singapore" },
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStory(slug);
  return (
    <>
      {story && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleJsonLd(story)) }} />
      )}
      <StoryDetailContent slug={slug} />
    </>
  );
}
