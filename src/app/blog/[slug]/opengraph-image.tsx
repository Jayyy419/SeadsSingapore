import { stories } from "@/content/siteContent";
import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = stories.find((s) => s.slug === slug);
  return buildOgImage(story?.title.en ?? "Seads Story", "Story");
}
