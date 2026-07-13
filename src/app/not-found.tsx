import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <SiteShell title="Page not found" subtitle="This one didn't take root — the page you're looking for doesn't exist or has moved.">
      <div className="section-card flex flex-col items-start gap-4 p-6 sm:p-8">
        <p className="text-sm text-[color:var(--muted)]">
          Try the navigation above, or jump back to one of these:
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Back to homepage
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[color:var(--foreground-soft)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            Contact us
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
