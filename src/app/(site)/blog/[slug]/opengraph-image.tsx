import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

async function getStoryTitle(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/stories`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const story = (data.stories ?? []).find((s: { slug: string }) => s.slug === slug);
    return story?.title?.en ?? null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = await getStoryTitle(slug);
  return buildOgImage(title ?? "Seads Story", "Story");
}
