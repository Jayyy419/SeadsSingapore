import Link from "next/link";
import { internalApiFetch } from "@/lib/internal-api";
import { events } from "@/content/siteContent";

// Fetches live protected data on every request via internalApiFetch(), which reads the
// session cookie through next/headers' cookies() — that throws if called outside a real
// request context, so this must never be statically prerendered.
export const dynamic = "force-dynamic";

async function getRsvpCounts(): Promise<Record<string, number>> {
  const res = await internalApiFetch("/internal/event-rsvp-counts");
  if (!res.ok) return {};
  const data = await res.json();
  return data.counts ?? {};
}

export default async function AdminEventsPage() {
  const counts = await getRsvpCounts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]">
        &larr; Admin
      </Link>
      <h1 className="font-display mt-4 mb-2 text-2xl">Event RSVP counts</h1>
      <p className="mb-6 text-sm text-[color:var(--muted)]">
        Computed live from interest-form submissions tagged to each event. The public capacity number (out of how many
        spots) is still set in siteContent.ts — this just shows how many have actually RSVP&apos;d.
      </p>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div key={event.slug} className="section-card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{event.title.en}</p>
              <p className="text-xs text-[color:var(--muted)]">{event.date}</p>
            </div>
            <p className="text-lg font-bold">{counts[event.slug] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
