import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminFetchError } from "@/components/admin-fetch-error";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type AuditEntry = {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  detail?: string | null;
  sourceIp?: string;
};

async function getAuditLog(): Promise<{ entries: AuditEntry[]; error: boolean }> {
  const res = await internalApiFetch("/internal/audit-log");
  if (!res.ok) return { entries: [], error: true };
  const data = await res.json();
  return { entries: data.entries ?? [], error: false };
}

export default async function AdminAuditLogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const { entries: allEntries, error } = await getAuditLog();

  const totalPages = Math.max(1, Math.ceil(allEntries.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const entries = allEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminShell
      title="Audit log"
      subtitle="A record of every admin write action — what changed and when. There's only one shared admin password rather than per-user accounts, so this can't attribute an action to a specific person; the source IP is included as a best-effort (not authoritative) signal for telling concurrent sessions apart."
    >
      <div className="section-card overflow-x-auto p-2">
        <table className="w-full min-w-[680px] text-left text-sm">
          <caption className="sr-only">Admin action audit log, most recent first</caption>
          <thead>
            <tr className="border-b border-[color:var(--foreground-soft)] text-xs uppercase text-[color:var(--muted)]">
              <th className="px-3 py-3">When</th>
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Entity</th>
              <th className="px-3 py-3">Detail</th>
              <th className="px-3 py-3">Source IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-[color:var(--foreground-soft)]/50 text-[color:var(--foreground)]">
                <td className="whitespace-nowrap px-3 py-3">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-3 py-3 capitalize">{e.action}</td>
                <td className="px-3 py-3">{e.entityType}</td>
                <td className="px-3 py-3 text-[color:var(--muted)]">{e.detail || "—"}</td>
                <td className="px-3 py-3 text-[color:var(--muted)]">{e.sourceIp || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && (
          <div className="p-4">
            <AdminFetchError />
          </div>
        )}
        {!error && allEntries.length === 0 && <p className="p-4 text-sm text-[color:var(--muted)]">No admin actions logged yet.</p>}
        <AdminPagination page={page} totalPages={totalPages} baseHref="/admin/audit-log" />
      </div>
    </AdminShell>
  );
}
