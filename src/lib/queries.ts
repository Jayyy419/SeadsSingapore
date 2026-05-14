import { groq } from "next-sanity";

export const homepageQuery = groq`*[_type == "homepage"][0] {
  title,
  tagline,
  heroTitle,
  heroBody,
  ctaPrimary,
  ctaSecondary,
  impactMetrics[]{value,label,note},
  featuredPrograms[]->{name,tag,description},
  featuredEvents[]->{title,date,location,type}
}`;

export const storiesQuery = groq`*[_type == "story"] | order(publishedAt desc) {
  title,
  category,
  excerpt,
  publishedAt
}`;
