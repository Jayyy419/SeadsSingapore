"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { useLocale } from "@/lib/locale-context";
import { usePrograms } from "@/lib/use-programs";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function ProgramDetailContent({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const { programs, loaded } = usePrograms();
  const program = programs.find((p) => p.slug === slug);
  // Wait for the live fetch before 404ing — see event-detail-content.tsx for why.
  if (!program && loaded) notFound();
  if (!program) return null;

  return (
    <SiteShell title={program.name[locale]} subtitle={program.description[locale]}>
      <div className="space-y-10">
        <article className="section-card space-y-4 p-6 sm:p-8">
          {program.photo && (
            <div className="relative h-48 w-full overflow-hidden rounded-xl">
              <Image src={program.photo} alt={program.name[locale]} fill sizes="(min-width: 640px) 640px, 100vw" className="object-cover" priority />
            </div>
          )}
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
          <div className="flex flex-wrap gap-3">
            <a
              href={buildWhatsAppLink(`${t.askViaWhatsApp}: ${program.name[locale]}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              {t.askViaWhatsApp}
            </a>
            <a
              href={`/programs/${program.slug}/qr`}
              download={`${program.slug}-qr.png`}
              className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              {t.downloadQrCode}
            </a>
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
