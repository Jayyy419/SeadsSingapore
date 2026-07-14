import { notFound } from "next/navigation";
import { programs } from "@/content/siteContent";
import { buildTrackedUrl, buildQrPng } from "@/lib/qr";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = programs.find((p) => p.slug === slug);
  if (!program) notFound();

  const targetUrl = buildTrackedUrl(`/programs/${slug}`, slug);
  const png = await buildQrPng(targetUrl);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${slug}-qr.png"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
