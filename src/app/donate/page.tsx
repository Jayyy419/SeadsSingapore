import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export default function DonatePage() {
  return (
    <SiteShell
      title="Donate"
      subtitle="Help us plant the next seed — support Seads' youth programs and community initiatives."
    >
      <section className="section-card p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Coming soon</p>
        <h2 className="font-display mt-2 text-3xl">Donations are opening soon</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--muted)]">
          We are finalizing secure contribution channels and impact transparency workflows. You can still support us by joining events or partnering today.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/events" className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white">
            Join Our Events
          </Link>
          <Link
            href="/partners"
            className="rounded-full border border-[color:var(--foreground-soft)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Partner with Seads
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
