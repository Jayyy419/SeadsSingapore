import type { MetadataRoute } from "next";
import { programs, events, stories } from "@/content/siteContent";

// Falls back to the current Amplify-assigned URL until a custom domain is set — update
// NEXT_PUBLIC_SITE_URL (or just this fallback) once that happens.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";

const ROUTES = ["", "/about", "/programs", "/events", "/team", "/contact", "/partners", "/donate", "/media", "/blog", "/join", "/privacy"];

const DETAIL_ROUTES = [
  ...programs.map((p) => `/programs/${p.slug}`),
  ...events.map((e) => `/events/${e.slug}`),
  ...stories.map((s) => `/blog/${s.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const detailEntries = DETAIL_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...detailEntries];
}
