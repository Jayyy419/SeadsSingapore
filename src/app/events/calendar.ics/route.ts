import { events } from "@/content/siteContent";
import { buildEventsIcsFeed } from "@/lib/ics";

// A single subscribable feed of every event, so a calendar app can pull new events
// automatically instead of needing a fresh .ics download each time. Feeds have no per-viewer
// locale (there's no request-time "who's asking"), so this uses English as the canonical
// language, same as metadata/JSON-LD elsewhere in the app.
export async function GET() {
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
