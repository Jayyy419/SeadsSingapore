import Link from "next/link";
import { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/impact-metrics", label: "Impact metrics" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/stories", label: "Story submissions" },
  { href: "/admin/audit-log", label: "Audit log" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
      >
        Skip to main content
      </a>
      <header className="border-b border-[color:var(--foreground-soft)] bg-[color:var(--surface)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" prefetch={false} className="font-display text-lg font-bold text-[color:var(--foreground)]">
              Seads <span className="text-[color:var(--brand)]">Admin</span>
            </Link>
            <nav className="hidden gap-4 text-sm sm:flex">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} prefetch={false} className="text-[color:var(--muted)] hover:text-[color:var(--brand)]">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" prefetch={false} className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]">
              View site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Admin</p>
          <h1 className="font-display text-3xl text-[color:var(--foreground)] sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-[color:var(--muted)]">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
