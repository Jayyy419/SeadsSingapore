import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { InterestForm } from "@/components/interest-form";

export const metadata: Metadata = {
  title: "Join Seads",
  description: "Start your journey with Seads as a participant, volunteer, contributor, or community partner.",
};

const steps = [
  "Tell us a bit about yourself below",
  "We match you to programs and volunteer tracks that fit",
  "Receive onboarding details from the team",
];

export default function JoinPage() {
  return (
    <SiteShell
      title="Join Seads"
      subtitle="Start your journey as a participant, volunteer, contributor, or community partner."
    >
      <div className="space-y-10">
        <section className="section-card p-6">
          <h2 className="font-display text-2xl">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
            {steps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </section>

        <InterestForm
          heading="Start Your Journey"
          body="Tell us your interests and we'll suggest relevant tracks in sustainability, mental health, or leadership."
        />
      </div>
    </SiteShell>
  );
}
