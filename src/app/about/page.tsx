import { SiteShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell
      title="About Seads"
      subtitle="Seads is a youth-led non-profit cultivating sustainability, mental health awareness, and personal growth across Southeast Asia."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-card p-6 lg:col-span-2">
          <h2 className="font-display text-2xl">Our Mission</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            We equip young people with the soil, water, and light to grow — pathways to lead projects, support communities, and co-create solutions with schools, families, and partners across the region.
          </p>
          <h3 className="font-display mt-6 text-xl">Our Vision</h3>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            A Southeast Asia where every young person has the same access to support, and the same room to grow into resilient, inclusive, future-ready communities.
          </p>
        </article>

        <article className="section-card p-6">
          <h2 className="font-display text-xl">Core Values</h2>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
            <li>Youth agency</li>
            <li>Community trust</li>
            <li>Action over noise</li>
            <li>Measurable outcomes</li>
          </ul>
        </article>
      </section>
    </SiteShell>
  );
}
