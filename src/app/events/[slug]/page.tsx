import type { Metadata } from "next";
import { EventDetailContent } from "./event-detail-content";

// Events moved from siteContent.ts (static) to DynamoDB so admins can create them without a
// code change + deploy — that means generateStaticParams can no longer enumerate them at
// build time, so this route renders dynamically per request instead of via SSG.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

async function getEvent(slug: string) {
  const res = await fetch(`${API_BASE_URL}/events`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.events ?? []).find((event: { slug: string }) => event.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  return {
    title: event.title.en,
    description: `${event.type.en} · ${event.date} · ${event.location.en}`,
  };
}

// Only fields backed by real event data — no fabricated end time/pricing/performer info.
function buildEventJsonLd(event: { title: { en: string }; date: string; location: { en: string }; body: { en: string[] } }) {
  const startDate = new Date(event.date);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title.en,
    ...(Number.isNaN(startDate.getTime()) ? {} : { startDate: startDate.toISOString() }),
    location: { "@type": "Place", name: event.location.en },
    description: event.body.en.join(" "),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  return (
    <>
      {event && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventJsonLd(event)) }} />
      )}
      <EventDetailContent slug={slug} />
    </>
  );
}
