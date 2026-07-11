import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { programs } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Signature Programs",
  description: "Explore Seads initiatives across sustainability, mental health, leadership, innovation, media, and service.",
};

export default function ProgramsPage() {
  return (
    <SiteShell
      title="Signature Programs"
      subtitle="Seads initiatives across sustainability, mental health, leadership, innovation, media, and service."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((program) => (
          <article key={program.name} className="section-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{program.tag}</p>
            <h2 className="font-display mt-2 text-xl">{program.name}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{program.description}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
