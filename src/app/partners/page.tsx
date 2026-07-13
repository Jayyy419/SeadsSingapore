import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Partners",
  description: "Seads collaborates with schools, NGOs, and private sector partners across Southeast Asia to multiply community outcomes.",
};

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

      <div className="section-card mt-4 flex flex-col items-center gap-3 p-8 text-center">
        <h2 className="font-display text-2xl">Ready to partner with us?</h2>
        <p className="max-w-lg text-sm text-[color:var(--muted)]">
          Tell us about your organization and what you&rsquo;re looking to do together — we&rsquo;ll follow up to
          discuss the right fit.
        </p>
        <Link
          href="/join"
          className="mt-1 rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
        >
          Become a partner
        </Link>
      </div>
    </SiteShell>
  );
}
