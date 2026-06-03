"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.localStorage.getItem("spark-motion") !== "off";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    document.documentElement.dataset.motion = motionEnabled ? "on" : "off";
  }, [motionEnabled]);

  const toggleMotion = () => {
    const nextEnabled = !motionEnabled;
    setMotionEnabled(nextEnabled);
    if (nextEnabled) {
      window.localStorage.setItem("spark-motion", "on");
      document.documentElement.dataset.motion = "on";
    } else {
      window.localStorage.setItem("spark-motion", "off");
      document.documentElement.dataset.motion = "off";
    }
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--foreground-soft)] bg-[color:var(--background-overlay)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <p className="font-display text-xl font-bold tracking-wide">Spark SG</p>
          <p className="text-xs text-[color:var(--muted)]">Youth-led social impact network</p>
        </Link>

        <nav className="hidden items-center gap-2 text-sm lg:flex">
          <Link
            href="/"
            className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)] magnetic"
            data-magnetic="true"
          >
            Home
          </Link>

          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 font-semibold text-[color:var(--foreground)] magnetic" data-magnetic="true">
              About
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[color:var(--foreground-soft)] bg-white p-2 shadow-xl">
              <Link href="/about" className="block rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--foreground)]">About</Link>
              <Link href="/team" className="block rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--foreground)]">Team</Link>
              <Link href="/contact" className="block rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--foreground)]">Contact</Link>
            </div>
          </details>

          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 font-semibold text-[color:var(--foreground)] magnetic" data-magnetic="true">
              Programs
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[color:var(--foreground-soft)] bg-white p-2 shadow-xl">
              <Link href="/programs" className="block rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--foreground)]">Programs</Link>
              <Link href="/events" className="block rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--foreground)]">Events</Link>
              <Link href="/partners" className="block rounded-xl px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--foreground)]">Partners</Link>
            </div>
          </details>

          <Link
            href="/media"
            className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)] magnetic"
            data-magnetic="true"
          >
            Media
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 text-[10px] font-semibold text-[color:var(--muted)]"
            onClick={toggleMotion}
          >
            {motionEnabled ? "FX On" : "FX Off"}
          </button>

          <button
          type="button"
          className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] lg:hidden"
          onClick={() => setDrawerOpen((current) => !current)}
        >
          Menu
        </button>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={toggleMotion}
            className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1 text-[11px] font-semibold text-[color:var(--muted)]"
          >
            {motionEnabled ? "FX On" : "FX Off"}
          </button>
          <div className="rounded-full border border-[color:var(--foreground-soft)] bg-white px-3 py-1 text-[11px] font-semibold text-[color:var(--muted)]">
            SG
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="border-t border-[color:var(--foreground-soft)] bg-white/95 px-4 pb-4 pt-2 lg:hidden">
          <div className="mx-auto w-full max-w-6xl space-y-3">
            <Link href="/" className="block rounded-2xl border border-[color:var(--foreground-soft)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]" onClick={() => setDrawerOpen(false)}>
              Home
            </Link>

            <details className="rounded-2xl border border-[color:var(--foreground-soft)] p-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[color:var(--foreground)]">About</summary>
              <div className="mt-2 space-y-1">
                <Link href="/about" className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]" onClick={() => setDrawerOpen(false)}>About</Link>
                <Link href="/team" className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]" onClick={() => setDrawerOpen(false)}>Team</Link>
                <Link href="/contact" className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]" onClick={() => setDrawerOpen(false)}>Contact</Link>
              </div>
            </details>

            <details className="rounded-2xl border border-[color:var(--foreground-soft)] p-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[color:var(--foreground)]">Programs</summary>
              <div className="mt-2 space-y-1">
                <Link href="/programs" className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]" onClick={() => setDrawerOpen(false)}>Programs</Link>
                <Link href="/events" className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]" onClick={() => setDrawerOpen(false)}>Events</Link>
                <Link href="/partners" className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]" onClick={() => setDrawerOpen(false)}>Partners</Link>
              </div>
            </details>

            <Link href="/media" className="block rounded-2xl border border-[color:var(--foreground-soft)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]" onClick={() => setDrawerOpen(false)}>
              Media
            </Link>

            <button
              type="button"
              onClick={toggleMotion}
              className="block w-full rounded-2xl border border-[color:var(--foreground-soft)] px-4 py-3 text-left text-sm font-semibold text-[color:var(--foreground)]"
            >
              Motion Effects: {motionEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
