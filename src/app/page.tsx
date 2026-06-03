"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  events,
  impactMetrics,
  programs,
  stories,
  teamMembers,
  testimonials,
} from "@/content/siteContent";

type Locale = "en" | "zh" | "ms" | "ta";

const copy: Record<
  Locale,
  {
    tagline: string;
    heroTitle: string;
    heroBody: string;
    ctaPrimary: string;
    ctaSecondary: string;
    sectionPrograms: string;
    sectionEvents: string;
    sectionStories: string;
    sectionImpact: string;
    sectionGallery: string;
    sectionTeam: string;
    sectionTestimonials: string;
    sectionInvolved: string;
    donateLabel: string;
    donateComingSoon: string;
    searchPlaceholder: string;
  }
> = {
  en: {
    tagline: "Tagline placeholder: Spark youth, shape communities.",
    heroTitle: "By Youth. For Community. Across Singapore.",
    heroBody:
      "Spark SG mobilizes students, families, and partners to co-create impact through events, programs, and stories that matter.",
    ctaPrimary: "Join Our Events",
    ctaSecondary: "Explore Programs",
    sectionPrograms: "Signature Programs",
    sectionEvents: "Upcoming Events",
    sectionStories: "Latest Stories",
    sectionImpact: "Our Impact",
    sectionGallery: "Photo Wall",
    sectionTeam: "Meet The Team",
    sectionTestimonials: "Voices From The Community",
    sectionInvolved: "Get Involved",
    donateLabel: "Donate",
    donateComingSoon: "Coming Soon",
    searchPlaceholder: "Search stories by title or category",
  },
  zh: {
    tagline: "Tagline placeholder: Spark youth, shape communities.",
    heroTitle: "By Youth. For Community. Across Singapore.",
    heroBody:
      "Spark SG mobilizes students, families, and partners to co-create impact through events, programs, and stories that matter.",
    ctaPrimary: "Join Our Events",
    ctaSecondary: "Explore Programs",
    sectionPrograms: "Signature Programs",
    sectionEvents: "Upcoming Events",
    sectionStories: "Latest Stories",
    sectionImpact: "Our Impact",
    sectionGallery: "Photo Wall",
    sectionTeam: "Meet The Team",
    sectionTestimonials: "Voices From The Community",
    sectionInvolved: "Get Involved",
    donateLabel: "Donate",
    donateComingSoon: "Coming Soon",
    searchPlaceholder: "Search stories by title or category",
  },
  ms: {
    tagline: "Tagline placeholder: Spark youth, shape communities.",
    heroTitle: "By Youth. For Community. Across Singapore.",
    heroBody:
      "Spark SG mobilizes students, families, and partners to co-create impact through events, programs, and stories that matter.",
    ctaPrimary: "Join Our Events",
    ctaSecondary: "Explore Programs",
    sectionPrograms: "Signature Programs",
    sectionEvents: "Upcoming Events",
    sectionStories: "Latest Stories",
    sectionImpact: "Our Impact",
    sectionGallery: "Photo Wall",
    sectionTeam: "Meet The Team",
    sectionTestimonials: "Voices From The Community",
    sectionInvolved: "Get Involved",
    donateLabel: "Donate",
    donateComingSoon: "Coming Soon",
    searchPlaceholder: "Search stories by title or category",
  },
  ta: {
    tagline: "Tagline placeholder: Spark youth, shape communities.",
    heroTitle: "By Youth. For Community. Across Singapore.",
    heroBody:
      "Spark SG mobilizes students, families, and partners to co-create impact through events, programs, and stories that matter.",
    ctaPrimary: "Join Our Events",
    ctaSecondary: "Explore Programs",
    sectionPrograms: "Signature Programs",
    sectionEvents: "Upcoming Events",
    sectionStories: "Latest Stories",
    sectionImpact: "Our Impact",
    sectionGallery: "Photo Wall",
    sectionTeam: "Meet The Team",
    sectionTestimonials: "Voices From The Community",
    sectionInvolved: "Get Involved",
    donateLabel: "Donate",
    donateComingSoon: "Coming Soon",
    searchPlaceholder: "Search stories by title or category",
  },
};

const gallery = [
const photoShowcase = [
  {
    title: "Youth leadership workshop",
    description: "Drop your own photo at public/photos/photo-1.svg",
    src: "/photos/photo-1.svg",
  },
  {
    title: "Community volunteering day",
    description: "Drop your own photo at public/photos/photo-2.svg",
    src: "/photos/photo-2.svg",
  },
  {
    title: "Partners and team planning",
    description: "Drop your own photo at public/photos/photo-3.svg",
    src: "/photos/photo-3.svg",
  },
];

const localeLabels: Record<Locale, string> = {
  en: "EN",
  zh: "ZH",
  ms: "MS",
  ta: "TA",
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [query, setQuery] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const t = copy[locale];
  const filteredStories = useMemo(
    () =>
      stories.filter((story) => {
        const search = query.trim().toLowerCase();
        if (!search) {
          return true;
        }

        return (
          story.title.toLowerCase().includes(search) ||
          story.category.toLowerCase().includes(search)
        );
      }),
    [query],
  );

  async function onInterestSubmit(formData: FormData) {
    const endpoint = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ENDPOINT;
    if (!endpoint) {
      setSubmitStatus("done");
      return;
    }

    setSubmitStatus("loading");
    try {
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        interest: formData.get("interest"),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setSubmitStatus("done");
    } catch {
      setSubmitStatus("error");
    }
  }

  return (
    <div className="min-h-screen soft-grid">
      <SiteHeader
        rightSlot={
          <div className="flex items-center gap-2 rounded-full border border-[color:var(--foreground-soft)] bg-white/80 p-1">
            {Object.keys(localeLabels).map((key) => {
              const value = key as Locale;
              const active = locale === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLocale(value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? "bg-[color:var(--foreground)] text-white"
                      : "text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]"
                  }`}
                >
                  {localeLabels[value]}
                </button>
              );
            })}
          </div>
        }
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="hero-glow section-card rise-in overflow-hidden p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-4 py-1 text-sm text-[color:var(--muted)]">
                <span className="h-2 w-2 rounded-full bg-[color:var(--brand)]" />
                {t.tagline}
              </p>

              <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">
                {t.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg text-[color:var(--muted)]">{t.heroBody}</p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-deep)]"
                >
                  {t.ctaPrimary}
                </Link>
                <Link
                  href="/programs"
                  className="rounded-full border border-[color:var(--foreground-soft)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)]"
                >
                  {t.ctaSecondary}
                </Link>
              </div>
            </div>

            <div className="section-card bg-white/80 p-6">
              <p className="text-sm font-semibold text-[color:var(--brand)]">Live priorities</p>
              <ul className="mt-4 space-y-3 text-sm text-[color:var(--foreground)]">
                <li>Event registrations and attendance conversion</li>
                <li>Volunteer onboarding and partner collaboration</li>
                <li>Fresh storytelling to grow engagement</li>
                <li>Multilingual access for wider outreach</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" id="impact">
          {impactMetrics.map((metric) => (
            <article key={metric.label} className="section-card rise-in p-5">
              <p className="text-3xl font-bold text-[color:var(--foreground)]">{metric.value}</p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">{metric.label}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{metric.note}</p>
            </article>
          ))}
        </section>

        <section id="programs" className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">{t.sectionPrograms}</h2>
            <Link href="/partners" className="text-sm font-semibold text-[color:var(--brand)]">
              Partner with us
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <article key={program.name} className="section-card p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">
                  {program.tag}
                </p>
                <h3 className="mt-2 text-xl">{program.name}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{program.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="events" className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">{t.sectionEvents}</h2>
            <Link
              href="/events"
              className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
            >
              {t.ctaPrimary}
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.title} className="section-card p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">
                  {event.type}
                </p>
                <h3 className="mt-2 text-xl">{event.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{event.date}</p>
                <p className="text-sm text-[color:var(--muted)]">{event.location}</p>
                <button
                  type="button"
                  className="mt-4 rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold transition hover:bg-[color:var(--foreground)] hover:text-white"
                >
                  Register
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2" id="stories">
          <article className="section-card p-6">
            <h2 className="text-3xl">{t.sectionStories}</h2>
            <input
              className="mt-4 w-full rounded-xl border border-[color:var(--foreground-soft)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-4 space-y-3">
              {filteredStories.slice(0, 3).map((story) => (
                <div
                  key={story.title}
                  className="rounded-xl border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand)]">
                    {story.category}
                  </p>
                  <h3 className="mt-1 font-semibold">{story.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{story.excerpt}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="section-card p-6">
            <h2 className="text-3xl">{t.sectionGallery}</h2>
            <div className="mt-4 grid gap-3">
              {photoShowcase.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-xl border border-[color:var(--foreground-soft)] bg-[color:var(--surface)]">
                  <img src={item.src} alt={item.title} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.title}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section id="team" className="space-y-5">
          <h2 className="text-3xl">{t.sectionTeam}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <article key={member.name} className="section-card p-5">
                <div className="h-24 rounded-xl bg-[color:var(--surface-2)]" />
                <h3 className="mt-3 text-lg">{member.name}</h3>
                <p className="text-sm text-[color:var(--brand)]">{member.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-3xl">{t.sectionTestimonials}</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.author} className="section-card p-6">
                <p className="text-sm text-[color:var(--foreground)]">&ldquo;{item.quote}&rdquo;</p>
                <footer className="mt-3 text-sm font-semibold text-[color:var(--foreground)]">
                  {item.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="section-card p-6 sm:p-8" id="contact">
          <h2 className="text-3xl">{t.sectionInvolved}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/events"
              className="rounded-xl bg-[color:var(--brand)] p-4 text-sm font-semibold text-white"
            >
              Join our events
            </Link>
            <Link
              href="/programs"
              className="rounded-xl border border-[color:var(--foreground-soft)] p-4 text-sm font-semibold text-[color:var(--foreground)]"
            >
              Explore our programs
            </Link>
            <Link
              href="/partners"
              className="rounded-xl border border-[color:var(--foreground-soft)] p-4 text-sm font-semibold text-[color:var(--foreground)]"
            >
              Partner opportunities
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-dashed border-[color:var(--foreground-soft)] p-4 text-sm font-semibold text-[color:var(--muted)]"
            >
              Contact us
            </Link>
          </div>

          <form className="mt-6 grid gap-3 md:grid-cols-2" action={onInterestSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              className="rounded-xl border border-[color:var(--foreground-soft)] bg-white px-4 py-3 text-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="rounded-xl border border-[color:var(--foreground-soft)] bg-white px-4 py-3 text-sm"
            />
            <input
              type="text"
              name="interest"
              placeholder="What are you interested in?"
              className="rounded-xl border border-[color:var(--foreground-soft)] bg-white px-4 py-3 text-sm md:col-span-2"
            />
            <p className="text-xs text-[color:var(--muted)] md:col-span-2">
              Google Sheets integration is ready for your account setup.
            </p>
            {submitStatus === "done" && (
              <p className="text-xs font-semibold text-[color:var(--brand)] md:col-span-2">
                Submission captured. Once your endpoint is added, entries will flow to Google Sheets.
              </p>
            )}
            {submitStatus === "error" && (
              <p className="text-xs font-semibold text-[color:var(--brand-deep)] md:col-span-2">
                Could not submit right now. Please try again.
              </p>
            )}
            <button
              type="submit"
              disabled={submitStatus === "loading"}
              className="w-fit rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {submitStatus === "loading" ? "Submitting..." : "Submit interest"}
            </button>
          </form>
        </section>
      </main>

      <footer className="border-t border-[color:var(--foreground-soft)] bg-[color:var(--foreground)] py-8 text-[color:var(--surface)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-5 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div>
            <p className="text-xl font-bold">Spark SG</p>
            <p className="mt-1 text-sm text-[color:var(--surface-soft)]">
              Youth-led programs, events, and partnerships for sustainable community impact.
            </p>
          </div>
          <div className="text-sm text-[color:var(--surface-soft)]">
            <p>Built with Next.js, Tailwind, and Sanity-ready content architecture.</p>
            <p className="mt-1">Vercel deployment ready.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
