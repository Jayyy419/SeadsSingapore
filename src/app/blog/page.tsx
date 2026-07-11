import type { Metadata } from "next";
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
          <article key={story.title} className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.category}</p>
            <h2 className="font-display mt-2 text-2xl">{story.title}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{story.excerpt}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
