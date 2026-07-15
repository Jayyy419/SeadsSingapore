import type { Metadata } from "next";
import { StoryDetailContent } from "./story-detail-content";
import { safeJsonLdString } from "@/lib/json-ld";

// Stories moved from siteContent.ts (static) to DynamoDB so admins can create/edit/delete
// them without a code change + deploy — that means generateStaticParams can no longer
// enumerate them at build time, so this route renders dynamically per request instead of SSG.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

async function getStory(slug: string) {
  const res = await fetch(`${API_BASE_URL}/stories`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.stories ?? []).find((story: { slug: string }) => story.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return {};
  return { title: story.title.en, description: story.excerpt.en, alternates: { canonical: `/blog/${slug}` } };
}

// Only fields backed by real story data — no fabricated publish date, since stories don't
// carry one.
function buildArticleJsonLd(story: NonNullable<Awaited<ReturnType<typeof getStory>>>) {
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
  const story = await getStory(slug);
  return (
    <>
      {story && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdString(buildArticleJsonLd(story)) }} />
      )}
      <StoryDetailContent slug={slug} />
    </>
  );
}
