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

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StoryDetailContent slug={slug} />;
}
