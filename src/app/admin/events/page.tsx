import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { AdminTranslations, TranslationField, countTranslatedLocales } from "@/components/admin-translations";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { EventSaveButton } from "@/components/event-save-button";
import Link from "next/link";
import { createEvent, updateEvent, deleteEvent } from "./actions";

// Fetches live protected data on every request via internalApiFetch(), which reads the
// session cookie through next/headers' cookies() — that throws if called outside a real
// request context, so this must never be statically prerendered.
export const dynamic = "force-dynamic";

type Event = {
  slug: string;
  type: Record<string, string>;
  title: Record<string, string>;
  date: string;
  location: Record<string, string>;
  body: Record<string, string[]>;
  capacity?: number;
  status?: "cancelled" | "postponed";
};

async function getEvents(): Promise<{ events: Event[]; error: boolean }> {
  const res = await internalApiFetch("/internal/events");
  if (!res.ok) return { events: [], error: true };
  const data = await res.json();
  return { events: data.events ?? [], error: false };
}

async function getRsvpCounts(): Promise<Record<string, number>> {
  const res = await internalApiFetch("/internal/event-rsvp-counts");
  if (!res.ok) return {};
  const data = await res.json();
  return data.counts ?? {};
}

export default async function AdminEventsPage() {
  const [{ events, error }, counts] = await Promise.all([getEvents(), getRsvpCounts()]);

  return (
    <AdminShell
      title="Events"
      subtitle="Events shown on /events. New entries start with English text in every language — open an event's Translations section to provide 中文/Melayu/हिन्दी versions."
    >
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <form key={event.slug} action={updateEvent} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <input type="hidden" name="slug" value={event.slug} />
            <div className="flex items-center justify-between sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">
                {event.slug} · {counts[event.slug] ?? 0} RSVPs
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/events/${event.slug}/check-in`}
                  className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]"
                >
                  Check-in
                </Link>
                <a
                  href={`/events/${event.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]"
                >
                  View on site ↗
                </a>
              </div>
            </div>
            <label className="text-sm text-[color:var(--foreground)]">
              Title (EN)
              <input
                name="titleEn"
                defaultValue={event.title?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Type (EN)
              <input
                name="typeEn"
                defaultValue={event.type?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Date
              <input
                name="date"
                defaultValue={event.date}
                placeholder="DD Mon YYYY, e.g. 18 Jul 2026"
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Location (EN)
              <input
                name="locationEn"
                defaultValue={event.location?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Description (EN) — one paragraph per line
              <textarea
                name="bodyEn"
                defaultValue={event.body?.en?.join("\n")}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Capacity (blank = no cap)
              <input
                name="capacity"
                type="number"
                min={0}
                defaultValue={event.capacity ?? ""}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Status
              <select
                name="status"
                defaultValue={event.status ?? "scheduled"}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              >
                <option value="scheduled">Scheduled (normal)</option>
                <option value="postponed">Postponed — banner shown, RSVPs stay open</option>
                <option value="cancelled">Cancelled — banner shown, RSVPs closed</option>
              </select>
            </label>
            <AdminTranslations translatedCount={countTranslatedLocales([event.title, event.type, event.location, event.body])}>
              {(
                [
                  ["Zh", "中文"],
                  ["Ms", "Bahasa Melayu"],
                  ["Hi", "हिन्दी"],
                ] as const
              ).map(([suffix, lang]) => (
                <div key={suffix} className="grid gap-3 sm:grid-cols-2">
                  <TranslationField base="title" suffix={suffix} label={`Title (${lang})`} defaultValue={event.title?.[suffix.toLowerCase()]} />
                  <TranslationField base="type" suffix={suffix} label={`Type (${lang})`} defaultValue={event.type?.[suffix.toLowerCase()]} />
                  <TranslationField base="location" suffix={suffix} label={`Location (${lang})`} defaultValue={event.location?.[suffix.toLowerCase()]} />
                  <TranslationField
                    base="body"
                    suffix={suffix}
                    label={`Description (${lang})`}
                    defaultValue={event.body?.[suffix.toLowerCase()]?.join("\n")}
                    textarea
                  />
                </div>
              ))}
            </AdminTranslations>
            <div className="flex gap-2 sm:col-span-2">
              <EventSaveButton
                originalStatus={event.status ?? "scheduled"}
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              />
              <ConfirmSubmitButton
                formAction={deleteEvent}
                confirmMessage={`Delete ${event.title?.en}? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && events.length === 0 && <p className="text-sm text-[color:var(--muted)]">No events yet.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a new event</h2>
        <form action={createEvent} className="section-card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-sm text-[color:var(--foreground)]">
            Title (EN)
            <input
              name="titleEn"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Type (EN)
            <input
              name="typeEn"
              required
              placeholder="e.g. Workshop"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Date
            <input
              name="date"
              required
              placeholder="DD Mon YYYY, e.g. 18 Jul 2026"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Location (EN)
            <input
              name="locationEn"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Description (EN) — one paragraph per line
            <textarea
              name="bodyEn"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Capacity (blank = no cap)
            <input
              name="capacity"
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add event
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
