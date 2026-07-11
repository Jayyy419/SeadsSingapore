import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { events } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Events",
  description: "Join upcoming Seads forums, workshops, and volunteer activations across Southeast Asia.",
};

export default function EventsPage() {
  return (
    <SiteShell
      title="Events"
      subtitle="Join upcoming Seads forums, workshops, and volunteer activations."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {events.map((event) => (
          <article key={event.title} className="section-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{event.type}</p>
            <h2 className="font-display mt-2 text-xl">{event.title}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{event.date}</p>
            <p className="text-sm text-[color:var(--muted)]">{event.location}</p>
            <Link
              href="/join"
              className="mt-4 inline-block rounded-full bg-[color:var(--inverse-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--inverse-fg)] hover:opacity-85"
            >
              Join Our Events
            </Link>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
