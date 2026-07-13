import type { Metadata } from "next";
import Link from "next/link";
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
          <Link
            key={program.slug}
            href={`/programs/${program.slug}`}
            className="section-card block p-6 text-inherit transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-[0_10px_26px_rgba(31,41,55,.08)]"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{program.tag}</p>
            <h2 className="font-display mt-2 text-xl">{program.name}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{program.description}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand)]">Learn more &rarr;</span>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
