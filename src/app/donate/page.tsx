import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function DonatePage() {
  return (
    <SiteShell
      title="Donate"
      subtitle="Support Spark SG's youth programs and community initiatives."
    >
      <section className="section-card p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5e7182]">Coming Soon</p>
        <h2 className="mt-2 text-3xl">Donations are opening soon</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#4f6273]">
          We are finalizing secure contribution channels and impact transparency workflows. You can still support us by joining events or partnering today.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/events" className="rounded-full bg-[#ff6b2c] px-5 py-2.5 text-sm font-semibold text-white">
            Join Our Events
          </Link>
          <Link
            href="/partners"
            className="rounded-full border border-[#13212f]/20 px-5 py-2.5 text-sm font-semibold text-[#13212f]"
          >
            Partner with Spark SG
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
