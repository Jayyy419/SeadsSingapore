import { stories } from "@/content/siteContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// Feeds have no per-viewer locale — English is canonical here, same reasoning as the
// events.ics feed and the page metadata elsewhere in the app.
export async function GET() {
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
