import { notFound } from "next/navigation";
import { buildTrackedUrl, buildQrPng } from "@/lib/qr";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetch(`${API_BASE_URL}/events`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { events: [] };
  const event = (data.events ?? []).find((e: { slug: string }) => e.slug === slug);
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
