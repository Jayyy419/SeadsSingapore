import type { Metadata } from "next";
import { events } from "@/content/siteContent";
import { EventDetailContent } from "./event-detail-content";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return {
    title: event.title.en,
    description: `${event.type.en} · ${event.date} · ${event.location.en}`,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventDetailContent slug={slug} />;
}
