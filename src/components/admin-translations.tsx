import type { ReactNode } from "react";

// Collapsible "Translations" section used by each admin edit form. Collapsed by default so
// the common case (English-only editing) stays uncluttered, but without this section the
// other three locales were literally unreachable — the site advertised zh/ms/hi while every
// admin-created item showed English to those visitors forever.
export function AdminTranslations({ children }: { children: ReactNode }) {
  return (
    <details className="rounded-lg border border-[color:var(--foreground-soft)] p-3 sm:col-span-2">
      <summary className="cursor-pointer text-sm font-semibold text-[color:var(--foreground)]">
        Translations — 中文 · Bahasa Melayu · हिन्दी (optional; untranslated fields fall back to English)
      </summary>
      <div className="mt-3 grid gap-3">{children}</div>
    </details>
  );
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
