import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";

const SECTIONS = [
  { href: "/admin/impact-metrics", label: "Impact metrics", description: "Create, edit, and delete the homepage's impact numbers." },
  { href: "/admin/events", label: "Events", description: "Create, edit, and delete events; see live RSVP counts per event." },
  { href: "/admin/team", label: "Team", description: "Edit team member bios and photos." },
  { href: "/admin/partners", label: "Partners", description: "Edit partner names, logos, and links." },
  { href: "/admin/programs", label: "Programs", description: "Create, edit, and delete programs, with photos." },
  { href: "/admin/submissions", label: "Interest form submissions", description: "Everyone who's filled in the 'Get Involved' form. Delete spam/test entries." },
  { href: "/admin/blog", label: "Blog", description: "Create and edit the staff-authored stories on /blog, with photos." },
  { href: "/admin/stories", label: "Story submissions", description: "Approve, reject, or delete community-submitted stories." },
  { href: "/admin/audit-log", label: "Audit log", description: "See a record of recent admin create/edit/delete actions." },
  { href: "/admin/settings", label: "Settings", description: "Change the admin password." },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="section-card block p-5 transition-colors hover:border-[color:var(--brand)]"
          >
            <h2 className="font-display text-lg text-[color:var(--foreground)]">{section.label}</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">{section.description}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
