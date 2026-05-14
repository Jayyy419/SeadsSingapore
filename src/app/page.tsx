"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
    sectionGallery: "Gallery Highlights",
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
    sectionGallery: "Gallery Highlights",
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
    sectionGallery: "Gallery Highlights",
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
    sectionGallery: "Gallery Highlights",
    sectionTeam: "Meet The Team",
    sectionTestimonials: "Voices From The Community",
    sectionInvolved: "Get Involved",
    donateLabel: "Donate",
    donateComingSoon: "Coming Soon",
    searchPlaceholder: "Search stories by title or category",
  },
};

const gallery = [
  {
    title: "Youth policy dialogue",
    type: "Photo",
    color: "from-[#ff6b2c]/40 to-[#f0b429]/20",
  },
  {
    title: "Volunteer day at neighborhood hubs",
    type: "Video",
    color: "from-[#0f7b78]/40 to-[#13212f]/20",
  },
  {
    title: "Climate challenge showcase",
    type: "Photo",
    color: "from-[#f0b429]/35 to-[#fffdf8]/40",
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
      <header className="sticky top-0 z-30 border-b border-[#13212f]/10 bg-[#f7f4ec]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-lg font-bold tracking-wide">Spark SG</p>
            <p className="text-xs text-[#5e7182]">Youth-led social impact network</p>
          </div>

          <nav className="hidden gap-5 text-sm text-[#13212f]/80 lg:flex">
            <Link href="/programs" className="hover:text-[#13212f]">
              Programs
            </Link>
            <Link href="/events" className="hover:text-[#13212f]">
              Events
            </Link>
            <Link href="/blog" className="hover:text-[#13212f]">
              Stories
            </Link>
            <Link href="/team" className="hover:text-[#13212f]">
              Team
            </Link>
            <Link href="/contact" className="hover:text-[#13212f]">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2 rounded-full border border-[#13212f]/20 bg-white/80 p-1">
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
                      ? "bg-[#13212f] text-white"
                      : "text-[#13212f]/75 hover:bg-[#13212f]/10"
                  }`}
                >
                  {localeLabels[value]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="hero-glow section-card rise-in overflow-hidden p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#13212f]/15 bg-[#fffdf8] px-4 py-1 text-sm text-[#5e7182]">
                <span className="h-2 w-2 rounded-full bg-[#ff6b2c]" />
                {t.tagline}
              </p>

              <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">
                {t.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg text-[#4f6273]">{t.heroBody}</p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="rounded-full bg-[#ff6b2c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d94c13]"
                >
                  {t.ctaPrimary}
                </Link>
                <Link
                  href="/programs"
                  className="rounded-full border border-[#13212f]/25 px-6 py-3 text-sm font-semibold text-[#13212f] transition hover:bg-[#13212f]/8"
                >
                  {t.ctaSecondary}
                </Link>
              </div>
            </div>

            <div className="section-card bg-white/80 p-6">
              <p className="text-sm font-semibold text-[#0f7b78]">Live priorities</p>
              <ul className="mt-4 space-y-3 text-sm text-[#274255]">
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
              <p className="text-3xl font-bold text-[#13212f]">{metric.value}</p>
              <p className="mt-2 text-sm font-semibold text-[#13212f]">{metric.label}</p>
              <p className="mt-1 text-sm text-[#5e7182]">{metric.note}</p>
            </article>
          ))}
        </section>

        <section id="programs" className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">{t.sectionPrograms}</h2>
            <Link href="/partners" className="text-sm font-semibold text-[#0f7b78]">
              Partner with us
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => (
              <article key={program.name} className="section-card p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#0f7b78]">
                  {program.tag}
                </p>
                <h3 className="mt-2 text-xl">{program.name}</h3>
                <p className="mt-2 text-sm text-[#5e7182]">{program.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="events" className="space-y-5">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">{t.sectionEvents}</h2>
            <Link
              href="/events"
              className="rounded-full bg-[#13212f] px-4 py-2 text-sm font-semibold text-white"
            >
              {t.ctaPrimary}
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.title} className="section-card p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#ff6b2c]">
                  {event.type}
                </p>
                <h3 className="mt-2 text-xl">{event.title}</h3>
                <p className="mt-2 text-sm text-[#5e7182]">{event.date}</p>
                <p className="text-sm text-[#5e7182]">{event.location}</p>
                <button
                  type="button"
                  className="mt-4 rounded-full border border-[#13212f]/20 px-4 py-2 text-sm font-semibold transition hover:bg-[#13212f] hover:text-white"
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
              className="mt-4 w-full rounded-xl border border-[#13212f]/20 bg-white px-4 py-3 text-sm outline-none ring-[#0f7b78]/30 focus:ring"
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-4 space-y-3">
              {filteredStories.slice(0, 3).map((story) => (
                <div
                  key={story.title}
                  className="rounded-xl border border-[#13212f]/10 bg-[#fffdf8] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0f7b78]">
                    {story.category}
                  </p>
                  <h3 className="mt-1 font-semibold">{story.title}</h3>
                  <p className="mt-1 text-sm text-[#5e7182]">{story.excerpt}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="section-card p-6">
            <h2 className="text-3xl">{t.sectionGallery}</h2>
            <div className="mt-4 grid gap-3">
              {gallery.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-xl border border-[#13212f]/12 bg-gradient-to-r ${item.color} p-4`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#13212f]">
                    {item.type}
                  </p>
                  <p className="mt-1 font-semibold text-[#13212f]">{item.title}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section id="team" className="space-y-5">
          <h2 className="text-3xl">{t.sectionTeam}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <article key={member.name} className="section-card p-5">
                <div className="h-24 rounded-xl bg-[#13212f]/8" />
                <h3 className="mt-3 text-lg">{member.name}</h3>
                <p className="text-sm text-[#0f7b78]">{member.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-3xl">{t.sectionTestimonials}</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.author} className="section-card p-6">
                <p className="text-sm text-[#274255]">&ldquo;{item.quote}&rdquo;</p>
                <footer className="mt-3 text-sm font-semibold text-[#13212f]">
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
              className="rounded-xl bg-[#ff6b2c] p-4 text-sm font-semibold text-white"
            >
              Join our events
            </Link>
            <Link
              href="/join"
              className="rounded-xl border border-[#13212f]/20 p-4 text-sm font-semibold text-[#13212f]"
            >
              Volunteer with Spark SG
            </Link>
            <Link
              href="/partners"
              className="rounded-xl border border-[#13212f]/20 p-4 text-sm font-semibold text-[#13212f]"
            >
              Partner opportunities
            </Link>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-dashed border-[#13212f]/25 p-4 text-sm font-semibold text-[#5e7182]"
            >
              {t.donateLabel} - {t.donateComingSoon}
            </button>
          </div>

          <form className="mt-6 grid gap-3 md:grid-cols-2" action={onInterestSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              className="rounded-xl border border-[#13212f]/20 bg-white px-4 py-3 text-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="rounded-xl border border-[#13212f]/20 bg-white px-4 py-3 text-sm"
            />
            <input
              type="text"
              name="interest"
              placeholder="What are you interested in?"
              className="rounded-xl border border-[#13212f]/20 bg-white px-4 py-3 text-sm md:col-span-2"
            />
            <p className="text-xs text-[#5e7182] md:col-span-2">
              Google Sheets integration is ready for your account setup.
            </p>
            {submitStatus === "done" && (
              <p className="text-xs font-semibold text-[#0f7b78] md:col-span-2">
                Submission captured. Once your endpoint is added, entries will flow to Google Sheets.
              </p>
            )}
            {submitStatus === "error" && (
              <p className="text-xs font-semibold text-[#d94c13] md:col-span-2">
                Could not submit right now. Please try again.
              </p>
            )}
            <button
              type="submit"
              disabled={submitStatus === "loading"}
              className="w-fit rounded-full bg-[#0f7b78] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {submitStatus === "loading" ? "Submitting..." : "Submit interest"}
            </button>
          </form>
        </section>
      </main>

      <footer className="border-t border-[#13212f]/12 bg-[#13212f] py-8 text-[#f7f4ec]">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-5 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div>
            <p className="text-xl font-bold">Spark SG</p>
            <p className="mt-1 text-sm text-[#f7f4ec]/70">
              Youth-led programs, events, and partnerships for sustainable community impact.
            </p>
          </div>
          <div className="text-sm text-[#f7f4ec]/70">
            <p>Built with Next.js, Tailwind, and Sanity-ready content architecture.</p>
            <p className="mt-1">Vercel deployment ready.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
