import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminPagination } from "@/components/admin-pagination";
import { deleteSubmission } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type Submission = {
  id: string;
  name: string;
  email: string;
  interest: string;
  interestType: string;
  eventSlug?: string;
  submittedAt: string;
};

async function getSubmissions(): Promise<Submission[]> {
  const res = await internalApiFetch("/internal/submissions");
  if (!res.ok) return [];
  const data = await res.json();
  return data.submissions ?? [];
}

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const allSubmissions = await getSubmissions();

  const totalPages = Math.max(1, Math.ceil(allSubmissions.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const submissions = allSubmissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminShell title={`Interest form submissions (${allSubmissions.length})`}>
      <div className="section-card overflow-x-auto p-2">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--foreground-soft)] text-xs uppercase text-[color:var(--muted)]">
              <th className="px-3 py-3">Submitted</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Type</th>
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
                <td className="px-3 py-3">{s.interestType || "—"}</td>
                <td className="max-w-[280px] truncate px-3 py-3" title={s.interest}>
                  {s.interest || "—"}
                </td>
                <td className="px-3 py-3">
                  <form action={deleteSubmission}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-xs font-semibold text-[color:var(--muted)] hover:text-[#e2965f]">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allSubmissions.length === 0 && <p className="p-4 text-sm text-[color:var(--muted)]">No submissions yet.</p>}
        <AdminPagination page={page} totalPages={totalPages} baseHref="/admin/submissions" />
      </div>
    </AdminShell>
  );
}
