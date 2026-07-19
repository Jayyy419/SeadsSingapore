import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ExportCsvButton } from "@/components/export-csv-button";
import { deleteSubmission } from "./actions";
import { filterSubmissions, type Submission } from "./filter";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const INTEREST_TYPE_OPTIONS = ["volunteer", "partner", "event", "other", "newsletter"] as const;

async function getSubmissions(): Promise<{ submissions: Submission[]; error: boolean }> {
  const res = await internalApiFetch("/internal/submissions");
  if (!res.ok) return { submissions: [], error: true };
  const data = await res.json();
  return { submissions: data.submissions ?? [], error: false };
}

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; type?: string; event?: string }>;
}) {
  const { page: pageParam, q = "", type = "", event = "" } = await searchParams;
  const { submissions: allSubmissions, error } = await getSubmissions();

  const filtered = filterSubmissions(allSubmissions, q, type, event);
  const eventSlugs = Array.from(new Set(allSubmissions.map((s) => s.eventSlug).filter(Boolean))) as string[];

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const submissions = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterParams = new URLSearchParams();
  if (q) filterParams.set("q", q);
  if (type) filterParams.set("type", type);
  if (event) filterParams.set("event", event);
  const filterQuery = filterParams.toString();

  const inputClass = "rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm";

  return (
    <AdminShell title={`Interest form submissions (${filtered.length}${filtered.length !== allSubmissions.length ? ` of ${allSubmissions.length}` : ""})`}>
      {/* Plain GET form — filters live in the URL, so they survive refresh and can be shared. */}
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-[color:var(--muted)]">
          Search name / email / message
          <input name="q" defaultValue={q} placeholder="e.g. jane@" className={`mt-1 block w-56 ${inputClass}`} />
        </label>
        <label className="text-xs font-semibold text-[color:var(--muted)]">
          Type
          <select name="type" defaultValue={type} className={`mt-1 block ${inputClass}`}>
            <option value="">All types</option>
            {INTEREST_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[color:var(--muted)]">
          Event
          <select name="event" defaultValue={event} className={`mt-1 block ${inputClass}`}>
            <option value="">All events</option>
            {eventSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
        >
          Filter
        </button>
        <ExportCsvButton
          href={`/admin/submissions/export${filterQuery ? `?${filterQuery}` : ""}`}
          className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-60"
        />
      </form>

      <div className="section-card overflow-x-auto p-2">
        <table className="w-full min-w-[820px] text-left text-sm">
          <caption className="sr-only">Interest form submissions, most recent first</caption>
          <thead>
            <tr className="border-b border-[color:var(--foreground-soft)] text-xs uppercase text-[color:var(--muted)]">
              <th className="px-3 py-3">Submitted</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Event</th>
              <th className="px-3 py-3">Message</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-[color:var(--foreground-soft)]/50 text-[color:var(--foreground)]">
                <td className="whitespace-nowrap px-3 py-3">{new Date(s.submittedAt).toLocaleString()}</td>
                <td className="px-3 py-3">{s.name}</td>
                <td className="px-3 py-3">{s.email}</td>
                <td className="px-3 py-3">
                  {s.interestType || "—"}
                  {s.rsvpStatus && (
                    <span className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${s.rsvpStatus === "confirmed" ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]" : "bg-[#e2965f]/15 text-[#e2965f]"}`}>
                      {s.rsvpStatus}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">{s.eventSlug || "—"}</td>
                <td className="max-w-[240px] truncate px-3 py-3" title={s.interest}>
                  {s.interest || "—"}
                </td>
                <td className="px-3 py-3">
                  <form action={deleteSubmission}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`Delete the submission from ${s.name}? This can't be undone.`}
                      className="text-xs font-semibold text-[color:var(--muted)] hover:text-[#e2965f]"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && (
          <div className="p-4">
            <AdminFetchError />
          </div>
        )}
        {!error && filtered.length === 0 && (
          <p className="p-4 text-sm text-[color:var(--muted)]">
            {allSubmissions.length === 0 ? "No submissions yet." : "No submissions match these filters."}
          </p>
        )}
        <AdminPagination page={page} totalPages={totalPages} baseHref="/admin/submissions" extraParams={filterQuery} />
      </div>
    </AdminShell>
  );
}
