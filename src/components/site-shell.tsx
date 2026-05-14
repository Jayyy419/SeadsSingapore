import Link from "next/link";
import { ReactNode } from "react";

type SiteShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/team", label: "Team" },
  { href: "/partners", label: "Partners" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/join", label: "Join" },
  { href: "/donate", label: "Donate" },
];

export function SiteShell({ children, title, subtitle }: SiteShellProps) {
  return (
    <div className="min-h-screen soft-grid">
      <header className="sticky top-0 z-30 border-b border-[#13212f]/10 bg-[#f7f4ec]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            <p className="text-lg font-bold tracking-wide">Spark SG</p>
            <p className="text-xs text-[#5e7182]">Youth-led social impact network</p>
          </Link>

          <nav className="hidden flex-wrap items-center justify-end gap-3 text-sm text-[#13212f]/85 lg:flex">
            {navItems.map((item) => {
              const isDonate = item.href === "/donate";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1 transition hover:bg-[#13212f]/8 hover:text-[#13212f]"
                >
                  {item.label}
                  {isDonate && <span className="ml-1 text-[10px] text-[#5e7182]">soon</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {title && (
          <section className="hero-glow section-card mb-8 overflow-hidden p-8 sm:p-10">
            <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
            {subtitle && <p className="mt-3 max-w-2xl text-[#4f6273]">{subtitle}</p>}
          </section>
        )}
        {children}
      </main>

      <footer className="border-t border-[#13212f]/12 bg-[#13212f] py-8 text-[#f7f4ec]">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-5 px-4 sm:px-6 lg:flex-row lg:px-8">
          <div>
            <p className="text-xl font-bold">Spark SG</p>
            <p className="mt-1 text-sm text-[#f7f4ec]/70">
              Youth-led programs, events, and partnerships for sustainable community impact.
            </p>
          </div>
          <div className="text-sm text-[#f7f4ec]/70">
            <p>Next.js + Sanity-ready + Vercel deployment.</p>
            <p className="mt-1">Primary CTA: Join our events.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
