import { SiteShell } from "@/components/site-shell";
import { events } from "@/content/siteContent";

export default function EventsPage() {
  return (
    <SiteShell
      title="Events"
      subtitle="Join upcoming Spark SG forums, workshops, and volunteer activations."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {events.map((event) => (
          <article key={event.title} className="section-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{event.type}</p>
            <h2 className="mt-2 text-xl">{event.title}</h2>
            <p className="mt-3 text-sm text-[#4f6273]">{event.date}</p>
            <p className="text-sm text-[#4f6273]">{event.location}</p>
            <button
              type="button"
              className="mt-4 rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
            >
              Join Our Events
            </button>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
