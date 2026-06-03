import { SiteShell } from "@/components/site-shell";
import { stories } from "@/content/siteContent";

export default function BlogPage() {
  return (
    <SiteShell
      title="Blog and News"
      subtitle="Fresh stories from Spark SG programs, events, and community outcomes."
    >
      <section className="grid gap-4">
        {stories.map((story) => (
          <article key={story.title} className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand)]">{story.category}</p>
            <h2 className="mt-2 text-2xl">{story.title}</h2>
            <p className="mt-3 text-sm text-[#4f6273]">{story.excerpt}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
