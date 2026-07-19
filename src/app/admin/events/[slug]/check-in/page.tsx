import { notFound } from "next/navigation";
import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { setAttendance } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type Rsvp = { id: string; name: string; email: string; rsvpStatus: string | null; attended: boolean };
type EventItem = { slug: string; title: Record<string, string>; date: string };

async function getEvent(slug: string): Promise<EventItem | null> {
  const res = await internalApiFetch("/internal/events");
  if (!res.ok) return null;
  const data = await res.json();
  return (data.events ?? []).find((e: EventItem) => e.slug === slug) ?? null;
}

async function getRsvps(slug: string): Promise<{ rsvps: Rsvp[]; error: boolean }> {
  const res = await internalApiFetch(`/internal/events/${encodeURIComponent(slug)}/rsvps`);
  if (!res.ok) return { rsvps: [], error: true };
  const data = await res.json();
  return { rsvps: data.rsvps ?? [], error: false };
}

// Day-of check-in roster, replacing a paper sign-in sheet at the door — reuses the same RSVP
// rows written by the public interest form, just filtered to one event with a toggleable
// "attended" flag and a live headcount in the page subtitle.
export default async function EventCheckInPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [eventItem, { rsvps, error }] = await Promise.all([getEvent(slug), getRsvps(slug)]);
  if (!eventItem) notFound();

  const confirmed = rsvps.filter((r) => r.rsvpStatus !== "waitlisted");
  const checkedIn = confirmed.filter((r) => r.attended).length;

  return (
    <AdminShell
      title={`Check-in — ${eventItem.title?.en ?? slug}`}
      subtitle={`${eventItem.date} · ${checkedIn} of ${confirmed.length} confirmed guests checked in`}
    >
      {error && <AdminFetchError />}
      <div className="section-card overflow-x-auto p-2">
        <table className="w-full min-w-[600px] text-left text-sm">
          <caption className="sr-only">RSVP check-in list for {eventItem.title?.en ?? slug}</caption>
          <thead>
            <tr className="border-b border-[color:var(--foreground-soft)] text-xs uppercase text-[color:var(--muted)]">
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => (
              <tr key={r.id} className="border-b border-[color:var(--foreground-soft)]/50 text-[color:var(--foreground)]">
                <td className="px-3 py-3">{r.name}</td>
                <td className="px-3 py-3">{r.email}</td>
                <td className="px-3 py-3">
                  {r.rsvpStatus === "waitlisted" ? (
                    <span className="rounded-full bg-[#e2965f]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#e2965f]">Waitlisted</span>
                  ) : (
                    <span className="rounded-full bg-[color:var(--accent)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[color:var(--accent)]">
                      Confirmed
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <form action={setAttendance}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="attended" value={(!r.attended).toString()} />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        r.attended
                          ? "border border-[color:var(--foreground-soft)] text-[color:var(--muted)] hover:border-[#e2965f] hover:text-[#e2965f]"
                          : "bg-[color:var(--brand)] text-white hover:bg-[color:var(--brand-deep)]"
                      }`}
                    >
                      {r.attended ? "Checked in ✓ (undo)" : "Check in"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!error && rsvps.length === 0 && <p className="p-4 text-sm text-[color:var(--muted)]">No RSVPs for this event yet.</p>}
      </div>
    </AdminShell>
  );
}
