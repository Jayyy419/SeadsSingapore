import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach out to Seads for events, collaborations, media, and partnership opportunities.",
};

export default function ContactPage() {
  return (
    <SiteShell
      title="Contact"
      subtitle="Reach out for events, collaborations, media, and partnership opportunities."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-card p-6">
          <h2 className="font-display text-xl">General enquiries</h2>
          <a href="mailto:hello@seads.sg" className="mt-3 block text-sm text-[color:var(--muted)] hover:text-[color:var(--brand)]">
            hello@seads.sg
          </a>
        </article>
        <article className="section-card p-6">
          <h2 className="font-display text-xl">Partnerships</h2>
          <a href="mailto:partners@seads.sg" className="mt-3 block text-sm text-[color:var(--muted)] hover:text-[color:var(--brand)]">
            partners@seads.sg
          </a>
        </article>
        <article className="section-card p-6">
          <h2 className="font-display text-xl">Media</h2>
          <a href="mailto:media@seads.sg" className="mt-3 block text-sm text-[color:var(--muted)] hover:text-[color:var(--brand)]">
            media@seads.sg
          </a>
        </article>
      </section>
    </SiteShell>
  );
}
