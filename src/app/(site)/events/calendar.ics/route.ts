import { buildEventsIcsFeed } from "@/lib/ics";
import type { EventItem } from "@/content/siteContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

// A single subscribable feed of every event, so a calendar app can pull new events
// automatically instead of needing a fresh .ics download each time. Feeds have no per-viewer
// locale (there's no request-time "who's asking"), so this uses English as the canonical
// language, same as metadata/JSON-LD elsewhere in the app. Events moved from siteContent.ts
// (static) to DynamoDB, so this now fetches the live list on every request.
export async function GET() {
  const res = await fetch(`${API_BASE_URL}/events`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { events: [] };
  const events: EventItem[] = data.events ?? [];

  const feed = buildEventsIcsFeed(
    events.map((event) => ({
      title: event.title.en,
      description: event.body.en.join("\n\n"),
      location: event.location.en,
      date: event.date,
    }))
  );

  return new Response(feed, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="seads-events.ics"',
    },
  });
}
