import { SiteShell } from "@/components/site-shell";

const partnerTracks = [
  {
    title: "Schools and institutions",
    detail: "Co-develop youth learning pathways and civic leadership experiences.",
  },
  {
    title: "Community organizations",
    detail: "Scale volunteer delivery and co-create neighborhood impact programs.",
  },
  {
    title: "Corporate and sponsors",
    detail: "Support high-impact youth projects with resources, mentoring, and expertise.",
  },
];

export default function PartnersPage() {
  return (
    <SiteShell
      title="Partners"
      subtitle="Seads collaborates with schools, NGOs, and private sector partners across Southeast Asia to multiply community outcomes."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {partnerTracks.map((track) => (
          <article key={track.title} className="section-card p-6">
            <h2 className="font-display text-xl">{track.title}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{track.detail}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
