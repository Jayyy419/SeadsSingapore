import Link from "next/link";
import { internalApiFetch } from "@/lib/internal-api";
import { updateImpactMetric } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type Metric = {
  metricId: string;
  value: string;
  label: Record<string, string>;
  note: Record<string, string>;
};

async function getMetrics(): Promise<Metric[]> {
  const res = await internalApiFetch("/internal/impact-metrics");
  if (!res.ok) return [];
  const data = await res.json();
  return data.metrics ?? [];
}

export default async function AdminImpactMetricsPage() {
  const metrics = await getMetrics();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin" className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]">
        &larr; Admin
      </Link>
      <h1 className="font-display mt-4 mb-2 text-2xl">Impact metrics</h1>
      <p className="mb-6 text-sm text-[color:var(--muted)]">
        Only the English label/note are editable here — other languages keep their last translated value until updated
        separately (see docs/LEARNING_GUIDE.md).
      </p>
      <div className="flex flex-col gap-4">
        {metrics.map((metric) => (
          <form key={metric.metricId} action={updateImpactMetric} className="section-card grid gap-3 p-5 sm:grid-cols-3">
            <input type="hidden" name="metricId" value={metric.metricId} />
            <label className="text-sm">
              Value
              <input
                name="value"
                defaultValue={metric.value}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              Label (EN)
              <input
                name="labelEn"
                defaultValue={metric.label?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              Note (EN)
              <input
                name="noteEn"
                defaultValue={metric.note?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="sm:col-span-3 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
            >
              Save
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
