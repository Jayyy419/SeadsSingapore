import type { Story } from "@/content/siteContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// Feeds have no per-viewer locale — English is canonical here, same reasoning as the
// events.ics feed and the page metadata elsewhere in the app. Stories moved from
// siteContent.ts (static) to DynamoDB, so this now fetches the live list on every request.
export async function GET() {
  const res = await fetch(`${API_BASE_URL}/stories`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { stories: [] };
  const stories: Story[] = data.stories ?? [];

  const items = stories
    .map(
      (story) => `
    <item>
      <title>${escapeXml(story.title.en)}</title>
      <link>${SITE_URL}/blog/${story.slug}</link>
      <guid>${SITE_URL}/blog/${story.slug}</guid>
      <description>${escapeXml(story.excerpt.en)}</description>
      <category>${escapeXml(story.category.en)}</category>
    </item>`
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Seads Singapore — Stories</title>
    <link>${SITE_URL}/blog</link>
    <description>Latest stories from Seads Singapore</description>${items}
  </channel>
</rss>
`;

  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
