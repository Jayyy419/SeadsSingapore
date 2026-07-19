import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { submissionsByDay, interestTypeCounts, eventFillRates, storyStatusCounts, type Submission, type EventItem, type StorySubmission } from "./aggregate";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

async function getJson<T>(path: string, fallback: T): Promise<{ data: T; error: boolean }> {
  const res = await internalApiFetch(path);
  if (!res.ok) return { data: fallback, error: true };
  return { data: await res.json(), error: false };
}

export default async function AdminAnalyticsPage() {
  const [submissionsRes, eventsRes, storiesRes] = await Promise.all([
    getJson<{ submissions: Submission[] }>("/internal/submissions", { submissions: [] }),
    getJson<{ events: EventItem[] }>("/internal/events", { events: [] }),
    getJson<{ entries: StorySubmission[] }>("/internal/story-submissions", { entries: [] }),
  ]);

  const error = submissionsRes.error || eventsRes.error || storiesRes.error;
  const submissions = submissionsRes.data.submissions;
  const events = eventsRes.data.events;
  const stories = storiesRes.data.entries;

  const byDay = submissionsByDay(submissions, 30);
  const byType = interestTypeCounts(submissions);
  const fillRates = eventFillRates(events);
  const storyCounts = storyStatusCounts(stories);
  const maxDay = Math.max(1, ...byDay.map((d) => d.count));
  const maxType = Math.max(1, ...byType.map((t) => t.count));

  const statClass = "section-card p-4 text-center";
  const statNumClass = "font-display text-3xl text-[color:var(--foreground)]";
  const statLabelClass = "mt-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]";

  return (
    <AdminShell title="Analytics" subtitle="Aggregated from submissions, events, and story submissions already in the database — nothing tracked separately.">
      {error && <AdminFetchError />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className={statClass}>
          <p className={statNumClass}>{submissions.length}</p>
          <p className={statLabelClass}>Total submissions</p>
        </div>
        <div className={statClass}>
          <p className={statNumClass}>{events.length}</p>
          <p className={statLabelClass}>Events</p>
        </div>
        <div className={statClass}>
          <p className={statNumClass}>{storyCounts.pending}</p>
          <p className={statLabelClass}>Stories pending review</p>
        </div>
        <div className={statClass}>
          <p className={statNumClass}>{storyCounts.approved}</p>
          <p className={statLabelClass}>Stories approved</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Submissions — last 30 days</h2>
        <div className="section-card p-5">
          <div className="flex h-32 items-end gap-[3px]">
            {byDay.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className="min-w-[4px] flex-1 rounded-t bg-[color:var(--brand)]"
                style={{ height: `${Math.max(2, (d.count / maxDay) * 100)}%`, opacity: d.count === 0 ? 0.15 : 1 }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-[color:var(--muted)]">
            <span>{byDay[0]?.date}</span>
            <span>{byDay[byDay.length - 1]?.date}</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Submissions by type</h2>
          <div className="section-card grid gap-2.5 p-5">
            {byType.length === 0 && <p className="text-sm text-[color:var(--muted)]">No submissions yet.</p>}
            {byType.map((t) => (
              <div key={t.type}>
                <div className="mb-0.5 flex justify-between text-xs font-semibold text-[color:var(--foreground)]">
                  <span>{t.type}</span>
                  <span>{t.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--surface-2)]">
                  <div className="h-2 rounded-full bg-[color:var(--brand)]" style={{ width: `${(t.count / maxType) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Event RSVP fill rate</h2>
          <div className="section-card grid gap-2.5 p-5">
            {fillRates.length === 0 && <p className="text-sm text-[color:var(--muted)]">No events yet.</p>}
            {fillRates.map((e) => (
              <div key={e.slug}>
                <div className="mb-0.5 flex justify-between text-xs font-semibold text-[color:var(--foreground)]">
                  <span className="truncate">{e.title}</span>
                  <span className="shrink-0">{e.capacity ? `${e.rsvpCount}/${e.capacity}` : `${e.rsvpCount} (no cap)`}</span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--surface-2)]">
                  <div className="h-2 rounded-full bg-[color:var(--accent)]" style={{ width: `${e.percent ?? (e.rsvpCount > 0 ? 100 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
