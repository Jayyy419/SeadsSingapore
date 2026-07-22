"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = { href: string; label: string };
type NavGroup = { key: string; label: string; items: NavItem[] };

// 15 flat links in one row (the previous nav) wrapped onto 3+ lines on anything narrower than
// a very wide desktop — grouped here into the sections an admin actually thinks in: the
// content types they edit day-to-day, the two moderation inboxes, and account-level settings.
const GROUPS: NavGroup[] = [
  {
    key: "content",
    label: "Content",
    items: [
      { href: "/admin/impact-metrics", label: "Impact metrics" },
      { href: "/admin/events", label: "Events" },
      { href: "/admin/team", label: "Team" },
      { href: "/admin/partners", label: "Partners" },
      { href: "/admin/programs", label: "Programs" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/media", label: "Media" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/faq", label: "FAQ" },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    items: [
      { href: "/admin/submissions", label: "Submissions" },
      { href: "/admin/stories", label: "Story submissions" },
    ],
  },
  {
    key: "system",
    label: "System",
    items: [
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/audit-log", label: "Audit log" },
      { href: "/admin/site-settings", label: "Site settings" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

const linkClass = "text-[color:var(--muted)] hover:text-[color:var(--brand)]";
const activeLinkClass = "font-semibold text-[color:var(--brand)]";

export function AdminNav() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Click-outside and Escape both close whichever group is open — native <details> doesn't
  // do either on its own, and a dropdown menu that only closes by re-clicking its own button
  // reads as broken.
  useEffect(() => {
    if (!openGroup) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroup]);

  const isDashboardActive = pathname === "/admin";

  return (
    <nav ref={containerRef} className="flex flex-wrap items-center gap-4 text-sm">
      <Link href="/admin" prefetch={false} className={isDashboardActive ? activeLinkClass : linkClass}>
        Dashboard
      </Link>

      {GROUPS.map((group) => {
        const isGroupActive = group.items.some((item) => pathname?.startsWith(item.href));
        const isOpen = openGroup === group.key;
        return (
          <div key={group.key} className="relative">
            <button
              type="button"
              onClick={() => setOpenGroup(isOpen ? null : group.key)}
              aria-expanded={isOpen}
              className={`flex items-center gap-1 ${isGroupActive ? activeLinkClass : linkClass}`}
            >
              {group.label}
              <span className={`text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true">
                ▾
              </span>
            </button>
            {isOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-1.5 shadow-lg"
              >
                {group.items.map((item) => {
                  const isItemActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      role="menuitem"
                      onClick={() => setOpenGroup(null)}
                      className={`block rounded-lg px-3 py-2 text-sm ${
                        isItemActive
                          ? "bg-[color:var(--brand)]/10 font-semibold text-[color:var(--brand)]"
                          : "text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
