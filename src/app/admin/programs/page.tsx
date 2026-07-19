import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { AdminTranslations, TranslationField, countTranslatedLocales } from "@/components/admin-translations";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { updateProgram, createProgram, deleteProgram } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type Program = {
  slug: string;
  tag: Record<string, string>;
  name: Record<string, string>;
  description: Record<string, string>;
  who: Record<string, string>;
  body: Record<string, string[]>;
  photo?: string;
  order?: number;
};

async function getPrograms(): Promise<{ programs: Program[]; error: boolean }> {
  const res = await internalApiFetch("/internal/programs");
  if (!res.ok) return { programs: [], error: true };
  const data = await res.json();
  return { programs: data.programs ?? [], error: false };
}

export default async function AdminProgramsPage() {
  const { programs, error } = await getPrograms();

  return (
    <AdminShell
      title="Programs"
      subtitle="Programs shown on /programs. New entries start with English text in every language — open a program's Translations section to provide 中文/Melayu/हिन्दी versions."
    >
      <div className="flex flex-col gap-4">
        {programs.map((program) => (
          <form key={program.slug} action={updateProgram} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <input type="hidden" name="slug" value={program.slug} />
            <div className="flex items-center justify-between sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{program.slug}</p>
              <a
                href={`/programs/${program.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]"
              >
                View on site ↗
              </a>
            </div>
            <label className="text-sm text-[color:var(--foreground)]">
              Name (EN)
              <input
                name="nameEn"
                defaultValue={program.name?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Tag (EN)
              <input
                name="tagEn"
                defaultValue={program.tag?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Order (lower shows first)
              <input
                type="number"
                name="order"
                defaultValue={program.order ?? 0}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Description (EN)
              <input
                name="descriptionEn"
                defaultValue={program.description?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Who it&apos;s for (EN)
              <input
                name="whoEn"
                defaultValue={program.who?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Description (EN) — one paragraph per line
              <textarea
                name="bodyEn"
                defaultValue={program.body?.en?.join("\n")}
                rows={4}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <AdminImageUpload name="photo" label="Photo" defaultValue={program.photo} />
            </div>
            <AdminTranslations
              translatedCount={countTranslatedLocales([program.name, program.tag, program.description, program.who, program.body])}
            >
              {(
                [
                  ["Zh", "中文"],
                  ["Ms", "Bahasa Melayu"],
                  ["Hi", "हिन्दी"],
                ] as const
              ).map(([suffix, lang]) => (
                <div key={suffix} className="grid gap-3 sm:grid-cols-2">
                  <TranslationField base="name" suffix={suffix} label={`Name (${lang})`} defaultValue={program.name?.[suffix.toLowerCase()]} />
                  <TranslationField base="tag" suffix={suffix} label={`Tag (${lang})`} defaultValue={program.tag?.[suffix.toLowerCase()]} />
                  <TranslationField
                    base="description"
                    suffix={suffix}
                    label={`Description (${lang})`}
                    defaultValue={program.description?.[suffix.toLowerCase()]}
                    textarea
                  />
                  <TranslationField base="who" suffix={suffix} label={`Who it's for (${lang})`} defaultValue={program.who?.[suffix.toLowerCase()]} textarea />
                  <TranslationField
                    base="body"
                    suffix={suffix}
                    label={`Body (${lang})`}
                    defaultValue={program.body?.[suffix.toLowerCase()]?.join("\n")}
                    textarea
                  />
                </div>
              ))}
            </AdminTranslations>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              >
                Save
              </button>
              <ConfirmSubmitButton
                formAction={deleteProgram}
                confirmMessage={`Delete ${program.name?.en}? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && programs.length === 0 && <p className="text-sm text-[color:var(--muted)]">No programs yet.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a new program</h2>
        <form action={createProgram} className="section-card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-sm text-[color:var(--foreground)]">
            Name (EN)
            <input
              name="nameEn"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Tag (EN)
            <input
              name="tagEn"
              required
              placeholder="e.g. Sustainability"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Description (EN)
            <input
              name="descriptionEn"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Who it&apos;s for (EN)
            <input
              name="whoEn"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Description (EN) — one paragraph per line
            <textarea
              name="bodyEn"
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <AdminImageUpload name="photo" label="Photo" />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add program
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
