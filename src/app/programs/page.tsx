import { SiteShell } from "@/components/site-shell";
import { programs } from "@/content/siteContent";

export default function ProgramsPage() {
  return (
    <SiteShell
      title="Programs"
      subtitle="Explore Spark SG initiatives across leadership, sustainability, well-being, innovation, media, and service."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((program) => (
          <article key={program.name} className="section-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{program.tag}</p>
            <h2 className="mt-2 text-xl">{program.name}</h2>
            <p className="mt-3 text-sm text-[#4f6273]">{program.description}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
