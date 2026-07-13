import type { MetadataRoute } from "next";

// Falls back to the current Amplify-assigned URL until a custom domain is set — update
// NEXT_PUBLIC_SITE_URL (or just this fallback) once that happens.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://main.d2mrph1bcp6pjx.amplifyapp.com";

const ROUTES = ["", "/about", "/programs", "/events", "/team", "/contact", "/partners", "/donate", "/media", "/blog", "/join", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
