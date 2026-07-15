import Link from "next/link";
import { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/impact-metrics", label: "Impact metrics" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/audit-log", label: "Audit log" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen">
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
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
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
