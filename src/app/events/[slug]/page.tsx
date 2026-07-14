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

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventDetailContent slug={slug} />;
}
