"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { usePrograms } from "@/lib/use-programs";

export function ProgramsContent() {
  const { locale, t } = useLocale();
  const { programs } = usePrograms();

  return (
    <SiteShell title={t.programsPageTitle} subtitle={t.programsPageSubtitle}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((program) => (
          <Link
            key={program.slug}
            href={`/programs/${program.slug}`}
            className="section-card block p-6 text-inherit transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-[0_10px_26px_rgba(31,41,55,.08)]"
          >
            {program.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={program.photo} alt="" className="mb-3 h-32 w-full rounded-lg object-cover" />
            )}
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{program.tag[locale]}</p>
            <h2 className="font-display mt-2 text-xl">{program.name[locale]}</h2>
            <p className="mt-3 text-sm text-[color:var(--muted)]">{program.description[locale]}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand)]">{t.learnMore} &rarr;</span>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
