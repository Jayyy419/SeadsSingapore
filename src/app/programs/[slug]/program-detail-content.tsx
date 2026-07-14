"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { useLocale } from "@/lib/locale-context";
import { programs } from "@/content/siteContent";

export function ProgramDetailContent({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const program = programs.find((p) => p.slug === slug);
  if (!program) notFound();

  return (
    <SiteShell title={program.name[locale]} subtitle={program.description[locale]}>
      <div className="space-y-10">
        <article className="section-card space-y-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{program.tag[locale]}</p>
          {program.body[locale].map((paragraph, i) => (
            <p key={i} className="text-sm text-[color:var(--muted)]">
              {paragraph}
            </p>
          ))}
          <div className="rounded-2xl bg-[color:var(--surface-2)] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--accent)]">{t.whoItsFor}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{program.who[locale]}</p>
          </div>
        </article>

        <InterestForm
          eyebrow={t.applyLabel}
          heading={`${t.joinProgramPrefix}${program.name[locale]}`}
          body={t.applyFormBody}
          interestPlaceholder={t.anythingElseOptional}
          submitLabel={t.applyLabel}
          prefillInterest={program.name[locale]}
          prefillInterestType="volunteer"
        />

        <Link href="/programs" className="inline-block text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
          &larr; {t.backToPrograms}
        </Link>
      </div>
    </SiteShell>
  );
}
