import type { MetadataRoute } from "next";

// Falls back to the current Vercel-assigned URL until a custom domain is set — update
// NEXT_PUBLIC_SITE_URL (or just this fallback) once that happens.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://seadssg.vercel.app";

const ROUTES = ["", "/about", "/programs", "/events", "/team", "/contact", "/partners", "/donate", "/media", "/blog", "/join"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
