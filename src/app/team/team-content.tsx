"use client";

import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";
import { useTeam } from "@/lib/use-team";

export function TeamContent() {
  const { locale, t } = useLocale();
  const { team } = useTeam();

  return (
    <SiteShell title={t.teamTitle} subtitle={t.teamPageSubtitle}>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member) => (
          <article key={member.slug} className="section-card p-5">
            {member.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.photo} alt={member.name} className="h-24 w-full rounded-xl object-cover" />
            ) : (
              <div className="stripe-ph flex h-24 items-center justify-center rounded-xl">
                <span className="text-[11px] text-[color:var(--brand-deep)]" style={{ fontFamily: "ui-monospace,monospace" }}>
                  portrait photo
                </span>
              </div>
            )}
            <h2 className="font-display mt-3 text-lg">{member.name}</h2>
            <p className="text-sm font-semibold text-[color:var(--brand)]">{member.role[locale]}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{member.bio[locale]}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
