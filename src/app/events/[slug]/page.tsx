import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { events } from "@/content/siteContent";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: `${event.type} · ${event.date} · ${event.location}`,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  return (
    <SiteShell title={event.title} subtitle={`${event.type} · ${event.date} · ${event.location}`}>
      <div className="space-y-10">
        <article className="section-card space-y-4 p-6 sm:p-8">
          {event.body.map((paragraph, i) => (
            <p key={i} className="text-sm text-[color:var(--muted)]">
              {paragraph}
            </p>
          ))}
        </article>

        <InterestForm
          eyebrow="RSVP"
          heading={`Join us at ${event.title}`}
          body="Tell us a bit about yourself and we'll follow up with the details."
          interestPlaceholder="Anything else we should know? (optional)"
          submitLabel="RSVP"
          prefillInterest={`RSVP: ${event.title} (${event.date})`}
          prefillInterestType="event"
        />
      </div>
    </SiteShell>
  );
}
