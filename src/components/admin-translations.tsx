import type { ReactNode } from "react";

// Collapsible "Translations" section used by each admin edit form. Collapsed by default so
// the common case (English-only editing) stays uncluttered, but without this section the
// other three locales were literally unreachable — the site advertised zh/ms/hi while every
// admin-created item showed English to those visitors forever.
//
// translatedCount (0-3, one per zh/ms/hi) lets the caller show a completeness signal in the
// collapsed summary — without it an admin had to expand every single item just to check
// whether it had been translated at all.
export function AdminTranslations({ children, translatedCount }: { children: ReactNode; translatedCount?: number }) {
  return (
    <details className="rounded-lg border border-[color:var(--foreground-soft)] p-3 sm:col-span-2">
      <summary className="cursor-pointer text-sm font-semibold text-[color:var(--foreground)]">
        Translations {typeof translatedCount === "number" && `(${translatedCount}/3) `}— 中文 · Bahasa Melayu · हिन्दी (optional;
        untranslated fields fall back to English)
      </summary>
      <div className="mt-3 grid gap-3">{children}</div>
    </details>
  );
}

// A locale counts as "translated" for a given item if any of its fields have content — a
// permissive, cheap-to-compute signal (not "every field filled") that's enough to tell an
// admin "this one hasn't been touched" apart from "this one has at least some translation".
export function countTranslatedLocales(fieldValues: Array<Record<string, string | string[] | undefined>>): number {
  return (["zh", "ms", "hi"] as const).filter((locale) =>
    fieldValues.some((field) => {
      const v = field[locale];
      return Array.isArray(v) ? v.length > 0 && v.some((s) => s.trim()) : Boolean(v?.trim());
    })
  ).length;
}

// One labeled input/textarea inside the Translations section, named e.g. "titleZh".
export function TranslationField({
  base,
  suffix,
  label,
  defaultValue,
  textarea = false,
}: {
  base: string;
  suffix: "Zh" | "Ms" | "Hi";
  label: string;
  defaultValue?: string;
  textarea?: boolean;
}) {
  const name = `${base}${suffix}`;
  const className = "mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm";
  return (
    <label className="text-sm text-[color:var(--foreground)]">
      {label}
      {textarea ? (
        <textarea name={name} rows={3} defaultValue={defaultValue} className={className} />
      ) : (
        <input name={name} defaultValue={defaultValue} className={className} />
      )}
    </label>
  );
}
