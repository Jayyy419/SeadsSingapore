import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { reviewStorySubmission, deleteStorySubmission } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type StorySubmission = {
  id: string;
  authorName: string;
  authorEmail: string;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

async function getStorySubmissions(): Promise<StorySubmission[]> {
  const res = await internalApiFetch("/internal/story-submissions");
  if (!res.ok) return [];
  const data = await res.json();
  return data.submissions ?? [];
}

export default async function AdminStoriesPage() {
  const submissions = await getStorySubmissions();
  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <AdminShell title={`Story moderation (${pending.length} pending)`}>
      <div className="flex flex-col gap-4">
        {pending.map((s) => (
          <article key={s.id} className="section-card p-5">
            <p className="text-xs text-[color:var(--muted)]">
              {s.authorName} · {s.authorEmail} · {new Date(s.submittedAt).toLocaleString()}
            </p>
            <h2 className="font-display mt-2 text-lg text-[color:var(--foreground)]">{s.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--muted)]">{s.body}</p>
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
                <button type="submit" className="rounded-full px-4 py-2 text-xs font-semibold text-[color:var(--muted)] hover:text-[#e2965f]">
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))}
        {pending.length === 0 && <p className="text-sm text-[color:var(--muted)]">No pending submissions.</p>}
      </div>

      {reviewed.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Reviewed</h2>
          <div className="flex flex-col gap-2">
            {reviewed.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm text-[color:var(--muted)]">
                <p>
                  {s.title} — <span className="font-semibold">{s.status}</span>
                </p>
                <form action={deleteStorySubmission}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="text-xs font-semibold text-[color:var(--muted)] hover:text-[#e2965f]">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
