import { SiteShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <SiteShell
      title="Contact"
      subtitle="Reach out for events, collaborations, media, and partnership opportunities."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-card p-6">
          <h2 className="font-display text-xl">General enquiries</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">hello@seads.sg</p>
        </article>
        <article className="section-card p-6">
          <h2 className="font-display text-xl">Partnerships</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">partners@seads.sg</p>
        </article>
        <article className="section-card p-6">
          <h2 className="font-display text-xl">Media</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">media@seads.sg</p>
        </article>
      </section>
    </SiteShell>
  );
}
