import Link from "next/link";
import { ReactNode } from "react";

type SiteHeaderProps = {
  rightSlot?: ReactNode;
};

export function SiteHeader({ rightSlot }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--foreground-soft)] bg-[color:var(--background-overlay)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <p className="text-lg font-bold tracking-wide">Spark SG</p>
          <p className="text-xs text-[color:var(--muted)]">Youth-led social impact network</p>
        </Link>

        <nav className="hidden items-center gap-2 text-sm lg:flex">
          <Link
            href="/"
            className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)]"
          >
            Home
          </Link>

          <div className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 text-[color:var(--muted)]">
            <span className="mr-2 text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">
              About
            </span>
            <Link href="/about" className="hover:text-[color:var(--foreground)]">
              About
            </Link>
            <span className="mx-2 opacity-40">/</span>
            <Link href="/team" className="hover:text-[color:var(--foreground)]">
              Team
            </Link>
            <span className="mx-2 opacity-40">/</span>
            <Link href="/contact" className="hover:text-[color:var(--foreground)]">
              Contact
            </Link>
          </div>

          <div className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 text-[color:var(--muted)]">
            <span className="mr-2 text-xs font-bold uppercase tracking-wide text-[color:var(--brand)]">
              Programs
            </span>
            <Link href="/programs" className="hover:text-[color:var(--foreground)]">
              Programs
            </Link>
            <span className="mx-2 opacity-40">/</span>
            <Link href="/events" className="hover:text-[color:var(--foreground)]">
              Events
            </Link>
            <span className="mx-2 opacity-40">/</span>
            <Link href="/partners" className="hover:text-[color:var(--foreground)]">
              Partners
            </Link>
          </div>
        </nav>

        {rightSlot ? (
          <div className="shrink-0">{rightSlot}</div>
        ) : (
          <div className="hidden rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--muted)] sm:block">
            Singapore
          </div>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-6xl gap-2 px-4 pb-3 sm:px-6 lg:hidden lg:px-8">
        <Link
          href="/"
          className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1 text-xs font-semibold"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1 text-xs font-semibold"
        >
          About & Team
        </Link>
        <Link
          href="/programs"
          className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1 text-xs font-semibold"
        >
          Programs & Events
        </Link>
      </div>
    </header>
  );
}
