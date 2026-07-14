"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { MediaMasonry } from "@/components/media-masonry";
import { InterestForm } from "@/components/interest-form";
import { useLocale } from "@/lib/locale-context";
import {
  events,
  impactMetrics as staticImpactMetrics,
  programs,
  stories,
  teamMembers,
  testimonials,
  type ImpactMetric,
} from "@/content/siteContent";

// Renders the static, hardcoded numbers immediately (no loading flash), then swaps in the
// admin-editable live values from DynamoDB (via the interest-form Lambda's public
// /impact-metrics endpoint) once they arrive — falls back to the static ones silently on
// any fetch error, since stale-but-real numbers beat a broken homepage.
function useImpactMetrics(): ImpactMetric[] {
  const [metrics, setMetrics] = useState<ImpactMetric[]>(staticImpactMetrics);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) return;

    let cancelled = false;
    fetch(`${baseUrl}/impact-metrics`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.metrics?.length) return;
        setMetrics(
          data.metrics.map((m: { value: string; label: Record<string, string>; note: Record<string, string> }) => ({
            value: m.value,
            label: m.label,
            note: m.note,
          }))
        );
      })
      .catch(() => {
        // Fetch failed — the static fallback set above stays in place.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return metrics;
}

export default function Home() {
  const { locale, t } = useLocale();
  const impactMetrics = useImpactMetrics();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-[90px] pt-24 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto max-w-[840px] text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8f7f]">{t.heroEyebrow}</p>
          <div className="flex flex-wrap items-baseline justify-center gap-4">
            <h1 className="font-display text-[clamp(56px,9vw,104px)] font-semibold leading-none text-[color:var(--foreground)]">
              Seads
            </h1>
            <span className="font-display text-2xl italic text-[#5c6b60]">/si:dz/</span>
          </div>
          <p className="my-4 font-medium italic text-[color:var(--brand)]">{t.heroPos}</p>

          <ol className="mx-auto flex max-w-[640px] flex-col gap-5 text-left" style={{ listStyle: "none", padding: 0 }}>
            <li className="flex gap-4">
              <span className="font-display text-xl font-semibold text-[color:var(--brand)]">1.</span>
              <span className="font-display text-xl leading-snug text-[color:var(--foreground)]">{t.heroDef1}</span>
            </li>
            <li className="flex gap-4">
              <span className="font-display text-xl font-semibold text-[color:var(--brand)]">2.</span>
              <span className="font-display text-xl leading-snug text-[color:var(--foreground)]">{t.heroDef2}</span>
            </li>
          </ol>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--foreground-strong)] px-4 py-2 text-[13px] font-semibold text-[color:var(--muted)]">
              {t.tagSea}
            </span>
            <span className="inline-flex items-center rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-[13px] font-semibold text-[color:var(--brand-deep)]">
              {t.tagEst}
            </span>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3.5">
            <a
              href="#programs"
              className="rounded-full bg-[color:var(--brand)] px-6.5 py-3.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
            >
              {t.ctaPrimary}
            </a>
            <Link
              href="/about"
              className="rounded-full border border-[color:var(--foreground-strong)] px-6.5 py-3.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-0 px-4 sm:px-6 lg:px-8">
        {/* IMPACT */}
        <section className="grid gap-4.5 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric) => (
            <article
              key={metric.label[locale]}
              className="rounded-[20px] border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-6 shadow-[0_10px_30px_rgba(31,41,55,.05)]"
            >
              <p className="font-display text-4xl font-bold text-[color:var(--foreground)]">{metric.value}</p>
              <p className="mt-2.5 text-sm font-bold text-[color:var(--foreground)]">{metric.label[locale]}</p>
              <p className="mt-1 text-[13px] text-[color:var(--muted)]">{metric.note[locale]}</p>
            </article>
          ))}
        </section>
      </main>

      {/* ABOUT / ETYMOLOGY STRIP */}
      <section id="about" className="bg-[color:var(--inverse-bg)] px-4 py-20 text-[color:var(--inverse-fg)] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1100px] items-center gap-11 lg:grid-cols-2">
          <div>
            <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9db3a3]">{t.aboutEyebrow}</p>
            <div className="mb-4.5 flex flex-wrap items-center gap-2.5">
              <span className="rounded-[10px] bg-[color:var(--brand)] px-3.5 py-2 text-[15px] font-bold text-[color:var(--brand-soft)]">SEA</span>
              <span className="text-lg font-semibold text-[#c9d2cd]">+</span>
              <span className="rounded-[10px] bg-[color:var(--accent)] px-3.5 py-2 text-[15px] font-bold text-[#fff0e2]">seeds</span>
            </div>
            <p className="font-display text-[26px] leading-snug text-[#f2f1ec]">{t.aboutBody1}</p>
          </div>
          <div>
            <p className="text-lg leading-[1.7] text-[#c9d2cd]">{t.aboutBody2}</p>
            <Link
              href="/team"
              className="mt-5.5 inline-block rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:border-white/50 hover:bg-white/10"
            >
              {t.aboutCta}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        {/* PROGRAMS */}
        <section id="programs" className="py-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{t.programsEyebrow}</p>
              <h2 className="font-display text-[38px]">{t.programsTitle}</h2>
            </div>
            <Link href="/partners" className="text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
              {t.programsLink} &rarr;
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {programs.map((program, i) => (
              <Link
                key={program.slug}
                href={`/programs/${program.slug}`}
                className="block rounded-[20px] border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-7 text-inherit transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_14px_34px_rgba(31,41,55,.1)]"
              >
                <div className="mb-3.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{program.tag[locale]}</span>
                  <span className="font-display text-sm text-[color:var(--foreground-soft)]">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-display mb-2.5 text-xl text-[color:var(--foreground)]">{program.name[locale]}</h3>
                <p className="text-[14.5px] text-[color:var(--muted)]">{program.description[locale]}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* EVENTS */}
      <section id="events" className="bg-[color:var(--surface-2)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <h2 className="font-display text-[38px]">{t.eventsTitle}</h2>
            <Link href="/events" className="rounded-full bg-[color:var(--inverse-bg)] px-5 py-2.5 text-sm font-semibold text-[color:var(--inverse-fg)] hover:opacity-85">
              {t.viewAll}
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.slug} className="rounded-[20px] border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-6.5">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">{event.type[locale]}</p>
                <h3 className="font-display mb-3 text-xl text-[color:var(--foreground)]">{event.title[locale]}</h3>
                <p className="text-sm text-[color:var(--muted)]">{event.date}</p>
                <p className="mb-4.5 mt-0.5 text-sm text-[color:var(--muted)]">{event.location[locale]}</p>
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-block rounded-full border border-[color:var(--foreground-soft)] px-5 py-2 text-[13px] font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                >
                  {t.viewDetailsRsvp}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES + GALLERY */}
      <section id="stories" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-[32px]">{t.storiesTitle}</h2>
              <Link href="/blog" className="text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
                {t.viewAll} &rarr;
              </Link>
            </div>
            <div className="flex flex-col gap-3.5">
              {stories.map((story) => (
                <Link
                  key={story.slug}
                  href={`/blog/${story.slug}`}
                  className="block rounded-2xl border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-5 text-inherit transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-[0_10px_26px_rgba(31,41,55,.08)]"
                >
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[color:var(--accent)]">{story.category[locale]}</p>
                  <h3 className="font-display mb-1.5 text-lg text-[color:var(--foreground)]">{story.title[locale]}</h3>
                  <p className="text-sm text-[color:var(--muted)]">{story.excerpt[locale]}</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-[32px]">{t.galleryTitle}</h2>
              <Link href="/media" className="text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--brand)]">
                {t.galleryLink} &rarr;
              </Link>
            </div>
            <MediaMasonry limit={6} showFilter={false} />
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="bg-[color:var(--brand-soft)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display mb-8 text-[38px]">{t.teamTitle}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Link
                key={member.name}
                href="/team"
                className="block rounded-[20px] bg-[color:var(--surface)] p-5 text-inherit transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(31,41,55,.1)]"
              >
                <div className="stripe-ph flex h-[140px] items-center justify-center rounded-2xl">
                  <span className="text-[11px] text-[color:var(--brand-deep)]" style={{ fontFamily: "ui-monospace,monospace" }}>
                    portrait photo
                  </span>
                </div>
                <h3 className="font-display mb-0.5 mt-4 text-lg text-[color:var(--foreground)]">{member.name}</h3>
                <p className="text-sm font-semibold text-[color:var(--brand)]">{member.role[locale]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-display mb-8 text-[38px]">{t.testimonialsTitle}</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.author[locale]} className="rounded-[20px] border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-6.5">
              <p className="font-display text-[17px] leading-relaxed text-[color:var(--foreground)]">&ldquo;{item.quote[locale]}&rdquo;</p>
              <footer className="mt-4 text-sm font-semibold text-[color:var(--brand)]">{item.author[locale]}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* GET INVOLVED */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <InterestForm />
      </section>

      {/* FOOTER */}
      <footer className="bg-[color:var(--footer-bg)] px-4 py-11 text-[color:var(--footer-fg)] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-5">
          <div>
            <p className="font-display text-xl font-bold">
              Seads <span className="font-display text-[13px] italic text-[#8fa295]">/si:dz/</span>
            </p>
            <p className="mt-1.5 max-w-[320px] text-[13px] text-[color:var(--footer-muted)]">{t.footerTagline}</p>
          </div>
          <div className="text-[13px] text-[color:var(--footer-muted)]">
            <p>{t.footerLocation}</p>
            <p className="mt-1">hello@seads.sg</p>
          </div>
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-wrap gap-4.5 border-t border-white/10 pt-5 text-[13px]">
          <Link href="/about" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.navAbout}</Link>
          <Link href="/team" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.navTeam}</Link>
          <Link href="/programs" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.navPrograms}</Link>
          <Link href="/media" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.navMedia}</Link>
          <Link href="/partners" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.navPartners}</Link>
          <Link href="/donate" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.navDonate}</Link>
          <Link href="/contact" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.navContact}</Link>
          <Link href="/privacy" className="text-[color:var(--footer-muted)] hover:text-[color:var(--footer-fg)]">{t.footerPrivacy}</Link>
        </div>
      </footer>
    </div>
  );
}
