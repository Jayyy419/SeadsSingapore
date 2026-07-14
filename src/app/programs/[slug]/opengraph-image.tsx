import { programs } from "@/content/siteContent";
import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  return buildOgImage(program?.name.en ?? "Seads Program", "Program");
}
