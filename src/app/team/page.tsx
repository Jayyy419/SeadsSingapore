import { SiteShell } from "@/components/site-shell";
import { teamMembers } from "@/content/siteContent";

export default function TeamPage() {
  return (
    <SiteShell
      title="Team"
      subtitle="Meet the people powering Spark SG across strategy, programs, and community partnerships."
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member) => (
          <article key={member.name} className="section-card p-5">
            <div className="h-24 rounded-xl bg-[color:var(--surface-2)]" />
            <h2 className="mt-3 text-lg">{member.name}</h2>
            <p className="text-sm text-[color:var(--brand)]">{member.role}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
