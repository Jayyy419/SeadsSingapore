import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin-logout-button";

const SECTIONS = [
  { href: "/admin/impact-metrics", label: "Impact metrics", description: "Edit the homepage's 4 impact numbers." },
  { href: "/admin/events", label: "Event RSVP counts", description: "Live RSVP counts computed from real submissions." },
  { href: "/admin/submissions", label: "Interest form submissions", description: "Everyone who's filled in the 'Get Involved' form." },
  { href: "/admin/stories", label: "Story moderation", description: "Approve or reject community-submitted stories." },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl">Admin</h1>
        <AdminLogoutButton />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="section-card block p-5 hover:border-[color:var(--brand)]"
          >
            <h2 className="font-display text-lg">{section.label}</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
