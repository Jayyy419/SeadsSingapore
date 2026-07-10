import { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

type SiteShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function SiteShell({ children, title, subtitle }: SiteShellProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        {title && (
          <section className="mb-12">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Seads</p>
            <h1 className="font-display text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">{title}</h1>
            {subtitle && <p className="mt-3 max-w-2xl text-[color:var(--muted)]">{subtitle}</p>}
          </section>
        )}
        {children}
      </main>

      <footer className="border-t border-[color:var(--foreground-soft)] bg-[color:var(--footer-bg)] py-8 text-[color:var(--footer-fg)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-5 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div>
            <p className="font-display text-xl font-bold">
              Seads <span className="font-display text-[13px] italic text-[color:var(--footer-muted)]">/si:dz/</span>
            </p>
            <p className="mt-1 max-w-xs text-sm text-[color:var(--footer-muted)]">
              A youth-led movement seeding sustainability, mental health awareness, and growth across Southeast Asia.
            </p>
          </div>
          <div className="text-sm text-[color:var(--footer-muted)]">
            <p>Singapore · est. across SEA</p>
            <p className="mt-1">hello@seads.sg</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
