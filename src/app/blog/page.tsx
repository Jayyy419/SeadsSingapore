import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { stories } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Latest Stories",
  description: "Fresh stories from Seads programs, events, and community outcomes across Southeast Asia.",
};

export default function BlogPage() {
  return (
    <SiteShell
      title="Latest Stories"
      subtitle="Fresh stories from Seads programs, events, and community outcomes across Southeast Asia."
    >
      <section className="grid gap-4">
        {stories.map((story) => (
          <Link
            key={story.slug}
            href={`/blog/${story.slug}`}
            className="section-card block p-6 text-inherit transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-[0_10px_26px_rgba(31,41,55,.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.category}</p>
            <h2 className="font-display mt-2 text-2xl">{story.title}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{story.excerpt}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand)]">Read story &rarr;</span>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
