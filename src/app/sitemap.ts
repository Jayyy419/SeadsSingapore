import type { MetadataRoute } from "next";

// Falls back to the current Amplify-assigned URL until a custom domain is set — update
// NEXT_PUBLIC_SITE_URL (or just this fallback) once that happens.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

const ROUTES = [
  "",
  "/about",
  "/programs",
  "/events",
  "/team",
  "/contact",
  "/partners",
  "/donate",
  "/media",
  "/blog",
  "/join",
  "/faq",
  "/my-activity",
  "/privacy",
];

// Events are DynamoDB-backed and admin-created/deleted at any time (see docs/LEARNING_GUIDE.md
// Part 13) — fetching the live list here, rather than the frozen siteContent.ts seed, keeps the
// sitemap from listing deleted events or omitting admin-created ones.
async function getEventSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/events`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events ?? []).map((event: { slug: string }) => event.slug);
  } catch {
    return [];
  }
}

// Same reasoning as getEventSlugs above.
async function getProgramSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/programs`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.programs ?? []).map((program: { slug: string }) => program.slug);
  } catch {
    return [];
  }
}

// Same reasoning as getEventSlugs above.
async function getStorySlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/stories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.stories ?? []).map((story: { slug: string }) => story.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [eventSlugs, programSlugs, storySlugs] = await Promise.all([getEventSlugs(), getProgramSlugs(), getStorySlugs()]);

  const detailRoutes = [
    ...programSlugs.map((slug) => `/programs/${slug}`),
    ...eventSlugs.map((slug) => `/events/${slug}`),
    ...storySlugs.map((slug) => `/blog/${slug}`),
  ];

  const staticEntries = ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const detailEntries = detailRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...detailEntries];
}
