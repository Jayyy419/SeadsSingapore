import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { AdminTranslations, TranslationField, countTranslatedLocales } from "@/components/admin-translations";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { updateImpactMetric, createImpactMetric, deleteImpactMetric } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type Metric = {
  metricId: string;
  value: string;
  label: Record<string, string>;
  note: Record<string, string>;
  order?: number;
};

async function getMetrics(): Promise<{ metrics: Metric[]; error: boolean }> {
  const res = await internalApiFetch("/internal/impact-metrics");
  if (!res.ok) return { metrics: [], error: true };
  const data = await res.json();
  return { metrics: data.metrics ?? [], error: false };
}

export default async function AdminImpactMetricsPage() {
  const { metrics, error } = await getMetrics();

  return (
    <AdminShell
      title="Impact metrics"
      subtitle="The headline numbers on the homepage. New entries start with English text in every language — open a metric's Translations section to provide 中文/Melayu/हिन्दी versions."
    >
      <div className="flex flex-col gap-4">
        {metrics.map((metric) => (
          <form key={metric.metricId} action={updateImpactMetric} className="section-card grid gap-3 p-5 sm:grid-cols-3">
            <input type="hidden" name="metricId" value={metric.metricId} />
            <label className="text-sm text-[color:var(--foreground)]">
              Value
              <input
                name="value"
                defaultValue={metric.value}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Label (EN)
              <input
                name="labelEn"
                defaultValue={metric.label?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Note (EN)
              <input
                name="noteEn"
                defaultValue={metric.note?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Order (lower shows first)
              <input
                type="number"
                name="order"
                defaultValue={metric.order ?? 0}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="sm:col-span-3">
              <AdminTranslations translatedCount={countTranslatedLocales([metric.label, metric.note])}>
                {(
                  [
                    ["Zh", "中文"],
                    ["Ms", "Bahasa Melayu"],
                    ["Hi", "हिन्दी"],
                  ] as const
                ).map(([suffix, lang]) => (
                  <div key={suffix} className="grid gap-3 sm:grid-cols-2">
                    <TranslationField base="label" suffix={suffix} label={`Label (${lang})`} defaultValue={metric.label?.[suffix.toLowerCase()]} />
                    <TranslationField base="note" suffix={suffix} label={`Note (${lang})`} defaultValue={metric.note?.[suffix.toLowerCase()]} />
                  </div>
                ))}
              </AdminTranslations>
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              >
                Save
              </button>
              <ConfirmSubmitButton
                formAction={deleteImpactMetric}
                confirmMessage={`Delete the "${metric.label?.en}" metric? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && metrics.length === 0 && <p className="text-sm text-[color:var(--muted)]">No metrics yet.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a new metric</h2>
        <form action={createImpactMetric} className="section-card grid gap-3 p-5 sm:grid-cols-3">
          <label className="text-sm text-[color:var(--foreground)]">
            Value
            <input
              name="value"
              required
              placeholder="e.g. 24"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Label (EN)
            <input
              name="labelEn"
              required
              placeholder="e.g. Partner schools"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Note (EN)
            <input
              name="noteEn"
              placeholder="optional"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="sm:col-span-3 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add metric
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
