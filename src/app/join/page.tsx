import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

const steps = [
  "Browse upcoming Spark SG events",
  "Submit your interest details",
  "Get matched to programs and volunteer tracks",
  "Receive onboarding details from the team",
];

export default function JoinPage() {
  return (
    <SiteShell
      title="Join Spark SG"
      subtitle="Start your journey as a participant, volunteer, contributor, or community partner."
    >
      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="section-card p-6">
          <h2 className="text-2xl">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#4f6273]">
            {steps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
          <Link
            href="/events"
            className="mt-6 inline-flex rounded-full bg-[#ff6b2c] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Join Our Events
          </Link>
        </article>

        <article className="section-card p-6">
          <h2 className="text-xl">Need help choosing?</h2>
          <p className="mt-3 text-sm text-[#4f6273]">
            Tell us your interests and we will suggest relevant tracks in leadership, service, or sustainability.
          </p>
        </article>
      </section>
    </SiteShell>
  );
}
