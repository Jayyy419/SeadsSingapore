import { SiteShell } from "@/components/site-shell";

export default function AboutPage() {
  return (
    <SiteShell
      title="About Spark SG"
      subtitle="Spark SG is a youth-powered movement building practical, community-first impact through programs, service, and cross-sector collaboration."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-card p-6 lg:col-span-2">
          <h2 className="text-2xl">Our Mission</h2>
          <p className="mt-3 text-sm text-[#4f6273]">
            We equip young people with pathways to lead projects, support communities, and co-create solutions with schools, families, and partners.
          </p>
          <h3 className="mt-6 text-xl">Our Vision</h3>
          <p className="mt-3 text-sm text-[#4f6273]">
            A Singapore where every young person can participate in shaping resilient, inclusive, and future-ready communities.
          </p>
        </article>

        <article className="section-card p-6">
          <h2 className="text-xl">Core Values</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#4f6273]">
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
