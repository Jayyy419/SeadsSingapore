import { notFound } from "next/navigation";
import { events } from "@/content/siteContent";
import { buildTrackedUrl, buildQrPng } from "@/lib/qr";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  if (!event) notFound();

  const targetUrl = buildTrackedUrl(`/events/${slug}`, slug);
  const png = await buildQrPng(targetUrl);

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${slug}-qr.png"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
