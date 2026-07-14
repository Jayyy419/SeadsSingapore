import Link from "next/link";
import { internalApiFetch } from "@/lib/internal-api";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

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

export default async function AdminSubmissionsPage() {
  const submissions = await getSubmissions();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/admin" className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]">
        &larr; Admin
      </Link>
      <h1 className="font-display mt-4 mb-6 text-2xl">Interest form submissions ({submissions.length})</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--foreground-soft)] text-xs uppercase text-[color:var(--muted)]">
              <th className="py-2 pr-4">Submitted</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Message</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-[color:var(--foreground-soft)]/50">
                <td className="py-2 pr-4 whitespace-nowrap">{new Date(s.submittedAt).toLocaleString()}</td>
                <td className="py-2 pr-4">{s.name}</td>
                <td className="py-2 pr-4">{s.email}</td>
                <td className="py-2 pr-4">{s.interestType || "—"}</td>
                <td className="py-2 pr-4 max-w-[320px] truncate" title={s.interest}>
                  {s.interest || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
