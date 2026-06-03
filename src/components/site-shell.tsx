import { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

type SiteShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function SiteShell({ children, title, subtitle }: SiteShellProps) {
  return (
    <div className="min-h-screen soft-grid">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {title && (
          <section className="hero-glow section-card mb-8 overflow-hidden p-8 sm:p-10">
            <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
            {subtitle && <p className="mt-3 max-w-2xl text-[color:var(--muted)]">{subtitle}</p>}
          </section>
        )}
        {children}
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
            <p>Next.js + Sanity-ready + Vercel deployment.</p>
            <p className="mt-1">Primary CTA: Join our events.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
