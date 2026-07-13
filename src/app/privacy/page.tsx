import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Seads collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <SiteShell title="Privacy Policy" subtitle="Last updated 13 July 2026.">
      <div className="section-card space-y-8 p-6 sm:p-8">
        <p className="text-sm text-[color:var(--muted)]">
          This page explains what personal data this website collects, why, and what happens
          to it. If anything here is unclear, email us at{" "}
          <a href="mailto:hello@seads.sg" className="text-[color:var(--brand)] hover:underline">
            hello@seads.sg
          </a>
          .
        </p>

        <section>
          <h2 className="font-display text-xl">What we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
            <li>
              <strong className="text-[color:var(--foreground)]">
                If you submit the &ldquo;Get Involved&rdquo; form:
              </strong>{" "}
              your name, email address, and whatever you write in the optional message field.
            </li>
            <li>
              <strong className="text-[color:var(--foreground)]">Site analytics:</strong>{" "}
              aggregated, cookieless page-visit data via Vercel Web Analytics — this doesn&rsquo;t
              identify you individually.
            </li>
            <li>
              <strong className="text-[color:var(--foreground)]">Bot protection:</strong> when
              you submit the form, Cloudflare Turnstile processes some technical signals from
              your browser to confirm you&rsquo;re not an automated bot, governed by{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--brand)] hover:underline"
              >
                Cloudflare&rsquo;s own privacy policy
              </a>
              .
            </li>
            <li>
              <strong className="text-[color:var(--foreground)]">Error diagnostics:</strong> if
              something breaks on the site, we may automatically capture technical details
              about the error (like the browser and page involved) to help us fix it — never
              intentionally including personal data.
            </li>
          </ul>
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            We don&rsquo;t use cookies. Your language and light/dark theme preference are saved
            only in your own browser&rsquo;s local storage — never sent to us or anyone else.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Why we collect it</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Solely to respond to your enquiry, follow up about getting involved with Seads, and
            keep the site working correctly and securely. We don&rsquo;t use your data for
            advertising, and we don&rsquo;t sell it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Where it&rsquo;s stored</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            Form submissions are stored on Amazon Web Services infrastructure located in
            Singapore. A notification email is sent to Seads staff when you submit the form.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">How long we keep it</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            We keep your information for as long as reasonably needed to respond to and follow
            up on your enquiry, or until you ask us to delete it — see below.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">Your rights</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            You can ask us what personal data we hold about you, ask us to correct it, or ask us
            to delete it, at any time, by emailing{" "}
            <a href="mailto:hello@seads.sg" className="text-[color:var(--brand)] hover:underline">
              hello@seads.sg
            </a>
            .
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
