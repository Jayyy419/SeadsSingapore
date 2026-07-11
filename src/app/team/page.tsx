import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { teamMembers } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Meet The Team",
  description: "Meet the people powering Seads across strategy, programs, and community partnerships.",
};

export default function TeamPage() {
  return (
    <SiteShell
      title="Meet The Team"
      subtitle="The people powering Seads across strategy, programs, and community partnerships."
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member) => (
          <article key={member.name} className="section-card p-5">
            <div className="stripe-ph flex h-24 items-center justify-center rounded-xl">
              <span className="text-[11px] text-[color:var(--brand-deep)]" style={{ fontFamily: "ui-monospace,monospace" }}>
                portrait photo
              </span>
            </div>
            <h2 className="font-display mt-3 text-lg">{member.name}</h2>
            <p className="text-sm font-semibold text-[color:var(--brand)]">{member.role}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
