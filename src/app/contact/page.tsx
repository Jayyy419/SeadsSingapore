import { SiteShell } from "@/components/site-shell";

export default function ContactPage() {
  return (
    <SiteShell
      title="Contact"
      subtitle="Reach out for events, collaborations, media, and partnership opportunities."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-card p-6">
          <h2 className="text-xl">General enquiries</h2>
          <p className="mt-3 text-sm text-[#4f6273]">hello@sparksg.org</p>
        </article>
        <article className="section-card p-6">
          <h2 className="text-xl">Partnerships</h2>
          <p className="mt-3 text-sm text-[#4f6273]">partners@sparksg.org</p>
        </article>
        <article className="section-card p-6">
          <h2 className="text-xl">Media</h2>
          <p className="mt-3 text-sm text-[#4f6273]">media@sparksg.org</p>
        </article>
      </section>
    </SiteShell>
  );
}
