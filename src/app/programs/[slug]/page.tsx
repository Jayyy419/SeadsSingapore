import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";
import { programs } from "@/content/siteContent";

export function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }));
}

function getProgram(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  return { title: program.name, description: program.description };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  return (
    <SiteShell title={program.name} subtitle={program.description}>
      <div className="space-y-10">
        <article className="section-card space-y-4 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{program.tag}</p>
          {program.body.map((paragraph, i) => (
            <p key={i} className="text-sm text-[color:var(--muted)]">
              {paragraph}
            </p>
          ))}
          <div className="rounded-2xl bg-[color:var(--surface-2)] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--accent)]">Who it&rsquo;s for</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{program.who}</p>
          </div>
        </article>

        <InterestForm
          eyebrow="Apply"
          heading={`Join ${program.name}`}
          body="Tell us a bit about yourself and we'll follow up with next steps."
          interestPlaceholder="Anything else we should know? (optional)"
          submitLabel="Apply"
          prefillInterest={`Interested in: ${program.name}`}
          prefillInterestType="volunteer"
        />
      </div>
    </SiteShell>
  );
}
