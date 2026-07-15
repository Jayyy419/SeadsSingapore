import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { reviewStorySubmission, deleteStorySubmission } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type StorySubmission = {
  id: string;
  authorName: string;
  authorEmail: string;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

async function getStorySubmissions(): Promise<{ submissions: StorySubmission[]; error: boolean }> {
  const res = await internalApiFetch("/internal/story-submissions");
  if (!res.ok) return { submissions: [], error: true };
  const data = await res.json();
  return { submissions: data.submissions ?? [], error: false };
}

export default async function AdminStoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const { submissions, error } = await getStorySubmissions();
  const pending = submissions.filter((s) => s.status === "pending");
  const allReviewed = submissions.filter((s) => s.status !== "pending");

  const totalPages = Math.max(1, Math.ceil(allReviewed.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const reviewed = allReviewed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminShell title={`Story moderation (${pending.length} pending)`}>
      <div className="flex flex-col gap-4">
        {pending.map((s) => (
          <article key={s.id} className="section-card p-5">
            <p className="text-xs text-[color:var(--muted)]">
              {s.authorName} · {s.authorEmail} · {new Date(s.submittedAt).toLocaleString()}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">
              Preview — how this will look on /blog/{"{slug}"}
            </p>
            <div className="mt-2 rounded-xl border border-[color:var(--foreground-soft)] p-4 sm:p-5">
              <h2 className="font-display text-lg text-[color:var(--foreground)]">{s.title}</h2>
              <div className="mt-3 space-y-3">
                {s.body
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed text-[color:var(--muted)]">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <form action={reviewStorySubmission}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="status" value="approved" />
                <button
                  type="submit"
                  className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
                >
                  Approve
                </button>
              </form>
              <form action={reviewStorySubmission}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="status" value="rejected" />
                <button
                  type="submit"
                  className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)]"
                >
                  Reject
                </button>
              </form>
              <form action={deleteStorySubmission}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmSubmitButton
                  confirmMessage={`Delete the submission "${s.title}"? This can't be undone.`}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-[color:var(--muted)] hover:text-[#e2965f]"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </article>
        ))}
        {error && <AdminFetchError />}
        {!error && pending.length === 0 && <p className="text-sm text-[color:var(--muted)]">No pending submissions.</p>}
      </div>

      {allReviewed.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Reviewed ({allReviewed.length})</h2>
          <div className="section-card flex flex-col gap-2 p-2">
            {reviewed.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 text-sm text-[color:var(--muted)]">
                <p>
                  {s.title} — <span className="font-semibold">{s.status}</span>
                </p>
                <form action={deleteStorySubmission}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Delete the submission "${s.title}"? This can't be undone.`}
                    className="text-xs font-semibold text-[color:var(--muted)] hover:text-[#e2965f]"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
            <AdminPagination page={page} totalPages={totalPages} baseHref="/admin/stories" />
          </div>
        </div>
      )}
    </AdminShell>
  );
}
