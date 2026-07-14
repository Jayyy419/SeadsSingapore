"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Locale } from "@/content/i18n";
import { useLocale } from "@/lib/locale-context";
import { buildBloom, buildVine, computeSprigs, type BloomChild, type FillerPetal, type Sprig } from "@/lib/vine";

const THEME_KEY = "seads-theme";
const MOBILE_BREAKPOINT = 860;
const NAV_ORDER = ["home", "programs", "stories", "about"] as const;
type GroupKey = (typeof NAV_ORDER)[number];

// lightest -> darkest across the 4 top-level groups, muted botanical tones
const PETAL_COLORS = ["#c7ddcd", "#a3c7ae", "#7cae8c", "#4f8a68"];
// every group's bloom uses the same "Get Involved" terracotta palette
const BLOOM_SCALE = ["#d9a679", "#cf9865", "#e0b48c"];

const LOCALE_META: { code: Locale; label: string; full: string }[] = [
  { code: "en", label: "EN", full: "English" },
  { code: "zh", label: "MN", full: "Mandarin" },
  { code: "ms", label: "BM", full: "Bahasa Melayu" },
  { code: "hi", label: "HI", full: "Hindi" },
];

type NavGroupDef = { key: GroupKey; label: string; href: string; children: { key: string; label: string; href: string }[] };

function activeGroupForPath(pathname: string): { group: GroupKey; child: string | null } {
  if (pathname === "/") return { group: "home", child: null };
  if (pathname.startsWith("/programs")) return { group: "programs", child: "programs" };
  if (pathname.startsWith("/events")) return { group: "programs", child: "events" };
  if (pathname.startsWith("/partners")) return { group: "programs", child: "partners" };
  if (pathname.startsWith("/media")) return { group: "stories", child: "media" };
  if (pathname.startsWith("/blog")) return { group: "stories", child: "stories" };
  if (pathname.startsWith("/about")) return { group: "about", child: "about" };
  if (pathname.startsWith("/contact")) return { group: "about", child: "contact" };
  if (pathname.startsWith("/team")) return { group: "about", child: "team" };
  return { group: "home", child: null };
}

export function SiteHeader() {
  const pathname = usePathname();
  const { group: activeGroupKey, child: activeChild } = activeGroupForPath(pathname ?? "/");
  const { locale, setLocale, t } = useLocale();

  // These start at the SSR-safe default (matching what the server rendered, since
  // window/localStorage aren't available at build/render time) and get corrected — if needed —
  // by a real post-mount setState in the effect below. Reading window/localStorage inside a
  // useState lazy initializer instead would make the *first* client render disagree with the
  // static HTML already in the DOM; React's hydration commit doesn't repaint mismatched
  // attributes in that case (it trusts the server markup), so nothing further ever corrects it
  // since no genuine re-render follows. A real effect-driven update is a normal post-hydration
  // render, which React does apply to the DOM.
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<GroupKey | null>(null);
  const [closingGroup, setClosingGroup] = useState<GroupKey | null>(null);
  const [hoveredLocale, setHoveredLocale] = useState<Locale | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [vine, setVine] = useState<{ width: number; height: number; path: string; sprigs: Sprig[] }>({
    width: 0,
    height: 44,
    path: "",
    sprigs: [],
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const vinePathRef = useRef<SVGPathElement | null>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isMobileRef = useRef(isMobile);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // Read the real client-only values once on mount and correct state/DOM as needed.
  // useLayoutEffect (not useEffect) so this commits before the browser paints the first
  // frame, avoiding a visible flash of the desktop nav on a mobile viewport.
  //
  // The setState calls below are deliberate, not the usual derived-state antipattern:
  // window/localStorage aren't available during the static prerender, so these can only be
  // read post-mount, and a real setState here (not a useState lazy initializer) is what makes
  // React actually repaint the mismatched markup instead of silently keeping the server's
  // stale attributes.
  useLayoutEffect(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    isMobileRef.current = mobile;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mobile);

    const resolvedTheme = window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    setTheme(resolvedTheme);
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, []);

  const measureVine = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    if (!cRect.width) return;
    const width = Math.ceil(cRect.width);
    setVine((prev) => {
      if (width === prev.width) return prev;
      const built = buildVine(width);
      return { width, height: 44, path: built.path, sprigs: prev.sprigs };
    });
  }, []);

  const computeSprigsNow = useCallback(() => {
    const pathEl = vinePathRef.current;
    const container = containerRef.current;
    if (!pathEl || !container) return;
    const cRect = container.getBoundingClientRect();
    const centers = NAV_ORDER.map((k) => groupRefs.current[k])
      .filter((el): el is HTMLDivElement => Boolean(el))
      .map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - cRect.left;
      });
    const nextSprigs = computeSprigs(pathEl, centers);
    if (!nextSprigs.length) return;
    setVine((prev) => (JSON.stringify(nextSprigs) !== JSON.stringify(prev.sprigs) ? { ...prev, sprigs: nextSprigs } : prev));
  }, []);

  useEffect(() => {
    measureVine();
    const raf = requestAnimationFrame(() => {
      measureVine();
      computeSprigsNow();
    });
    const timeout = setTimeout(() => {
      measureVine();
      computeSprigsNow();
    }, 300);
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (mobile !== isMobileRef.current) {
        isMobileRef.current = mobile;
        setIsMobile(mobile);
        if (!mobile) setMenuOpen(false);
      }
      measureVine();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-measure and re-align sprigs after every render (locale text width changes, group
  // state changes, etc. can all shift the container/button geometry).
  useEffect(() => {
    measureVine();
    const raf = requestAnimationFrame(computeSprigsNow);
    return () => cancelAnimationFrame(raf);
  });

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const rawGroups: NavGroupDef[] = [
    { key: "home", label: t.navHome, href: "/", children: [] },
    {
      key: "programs",
      label: t.navGetInvolved,
      href: "/events",
      children: [
        { key: "events", label: t.navEvents, href: "/events" },
        { key: "partners", label: t.navPartners, href: "/partners" },
        { key: "programs", label: t.navPrograms, href: "/programs" },
      ],
    },
    {
      key: "stories",
      label: t.navNewsroom,
      href: "/media",
      children: [
        { key: "media", label: t.navMedia, href: "/media" },
        { key: "stories", label: t.navStories, href: "/blog" },
      ],
    },
    {
      key: "about",
      label: t.navWhoWeAre,
      href: "/about",
      children: [
        { key: "about", label: t.navAbout, href: "/about" },
        { key: "contact", label: t.navContact, href: "/contact" },
        { key: "team", label: t.navTeam, href: "/team" },
      ],
    },
  ];

  const navGroups = rawGroups.map((g, i) => {
    const isActiveGroup = g.key === activeGroupKey;
    const bloom = g.children.length ? buildBloom(g.children, BLOOM_SCALE) : { kids: [] as BloomChild[], fillerPetals: [] as FillerPetal[] };
    const children = bloom.kids.map((c) => ({
      ...c,
      color: c.key === activeChild ? "var(--brand)" : "var(--foreground)",
      mobileColor: c.key === activeChild ? "var(--brand)" : "var(--foreground)",
    }));
    const isClosing = closingGroup === g.key;
    const isReallyOpen = openGroup === g.key;
    return {
      ...g,
      hasChildren: g.children.length > 0,
      isOpen: (isReallyOpen || isClosing) && g.children.length > 0,
      petalAnim: isClosing ? "seads-petal-shrink" : "seads-petal-grow",
      fpAnim: isClosing ? "seads-petal-shrink" : "seads-petal-grow",
      seedAnim: isClosing ? "seads-seed-shrink" : "seads-seed-pop",
      labelAnim: isClosing ? "seads-label-fall" : "seads-label-rise",
      petalColor: PETAL_COLORS[i],
      color: isReallyOpen || isActiveGroup ? "var(--brand-deep)" : "var(--foreground)",
      fontWeight: isActiveGroup ? 700 : 600,
      children,
      fillerPetals: bloom.fillerPetals,
    };
  });

  const locales = LOCALE_META.map((l) => ({
    ...l,
    active: l.code === locale,
    // Inactive buttons leave background undefined so the CSS hover class below can actually
    // apply — an inline style value here (even "transparent") would always beat a :hover rule.
    bg: l.code === locale ? "var(--foreground)" : undefined,
    color: l.code === locale ? "var(--background)" : "var(--muted)",
    showTip: hoveredLocale === l.code,
  }));

  const openGroupHandler = (key: GroupKey) => {
    clearTimeout(closeTimerRef.current);
    setOpenGroup(key);
    setClosingGroup(null);
  };

  const closeGroupHandler = (key: GroupKey) => {
    clearTimeout(closeTimerRef.current);
    setOpenGroup((prev) => (prev === key ? null : prev));
    setClosingGroup((prev) => (openGroup === key ? key : prev));
    closeTimerRef.current = setTimeout(() => {
      setClosingGroup((prev) => (prev === key ? null : prev));
    }, 380);
  };

  const themeIcon = theme === "dark" ? "☀" : "☽";
  // Links to /join rather than Donate — donations aren't live yet ("coming soon" on /donate),
  // so the site's single most prominent CTA shouldn't be a dead end. Donate is still
  // reachable from every footer.
  const ctaLabel = t.navGetInvolved;

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--foreground-soft)] bg-[color:var(--background-overlay)]">
      <div
        ref={containerRef}
        className="relative mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8"
      >
        <svg
          width={vine.width}
          height={vine.height}
          viewBox={`0 0 ${vine.width} ${vine.height}`}
          className="pointer-events-none absolute left-0 top-0 -z-10 overflow-visible"
        >
          <defs>
            <linearGradient id="seads-vine-taper" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--brand-deep)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--brand-deep)" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path ref={vinePathRef} d={vine.path} stroke="url(#seads-vine-taper)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d={vine.path} stroke="var(--brand)" strokeWidth="1.3" fill="none" opacity="0.55" strokeLinecap="round" />
          {vine.sprigs.map((sprig, i) => (
            <path key={i} d={sprig.path} style={{ fill: sprig.fill }} />
          ))}
        </svg>

        <Link href="/" className="flex shrink-0 items-center gap-2 justify-self-start">
          <svg width="24" height="24" viewBox="0 0 22 22" className="shrink-0">
            <ellipse cx="11" cy="13" rx="6" ry="7.5" fill="#8a5a34" />
            <path d="M11 6 C 9 2, 4 2, 3 5 C 6 6.5, 9 6.5, 11 6 Z" fill="#4f9c6f" />
            <path d="M11 6 C 13 2, 18 2, 19 5 C 16 6.5, 13 6.5, 11 6 Z" fill="#2f6f5e" />
          </svg>
          <span className="font-display text-2xl font-bold text-[color:var(--foreground)]">Seads</span>
          <span className="font-display text-[13px] italic text-[color:var(--muted)]">/si:dz/</span>
        </Link>

        <nav className={`${isMobile ? "hidden" : "flex"} items-start gap-0.5 pt-3.5 min-w-0 justify-self-center`}>
          {navGroups.map((group) => (
            <div
              key={group.key}
              ref={(el) => {
                groupRefs.current[group.key] = el;
              }}
              onMouseEnter={() => openGroupHandler(group.key)}
              onMouseLeave={() => closeGroupHandler(group.key)}
              onFocus={() => openGroupHandler(group.key)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) closeGroupHandler(group.key);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && openGroup === group.key) {
                  closeGroupHandler(group.key);
                  groupRefs.current[group.key]?.querySelector("a")?.focus();
                }
              }}
              className="relative"
            >
              <Link href={group.href} className="relative flex items-center justify-center rounded-full px-3.5 py-2.5">
                <span
                  className="relative z-10 whitespace-nowrap text-[13px]"
                  style={{ fontWeight: group.fontWeight, color: group.color }}
                >
                  {group.label}
                </span>
              </Link>

              {group.isOpen && (
                <div className="absolute left-1/2 top-full z-50 h-[180px] w-[230px] -translate-x-1/2">
                  <svg width="230" height="180" viewBox="0 0 230 180" className="pointer-events-none absolute inset-0 overflow-visible">
                    <defs>
                      <radialGradient id="seads-seed-grad" cx="35%" cy="30%" r="75%">
                        <stop offset="0%" stopColor="var(--brand)" />
                        <stop offset="100%" stopColor="var(--brand-deep)" />
                      </radialGradient>
                    </defs>
                    {group.fillerPetals.map((fp, i) => (
                      <g key={i} transform={fp.transform}>
                        <path
                          d={fp.path}
                          fill="var(--brand-soft)"
                          opacity="0.6"
                          style={{ transformOrigin: "115px 10px", animation: `${group.fpAnim} .38s cubic-bezier(.3,1.4,.6,1) both`, animationDelay: `${fp.delay}s` }}
                        />
                      </g>
                    ))}
                    {group.children.map((child) => (
                      <g key={child.key} transform={child.petalTransform}>
                        <path
                          d={child.petalPath}
                          fill={child.petalFill}
                          stroke="rgba(0,0,0,.1)"
                          strokeWidth="0.75"
                          style={{ transformOrigin: "115px 10px", animation: `${group.petalAnim} .42s cubic-bezier(.3,1.4,.6,1) both`, animationDelay: `${child.delay}s` }}
                        />
                        <path
                          d={`M115,10 L115,${child.veinY}`}
                          stroke="rgba(255,255,255,.4)"
                          strokeWidth="0.6"
                          style={{ transformOrigin: "115px 10px", animation: `${group.petalAnim} .42s cubic-bezier(.3,1.4,.6,1) both`, animationDelay: `${child.delay}s` }}
                        />
                      </g>
                    ))}
                    <circle
                      cx="115"
                      cy="10"
                      r="7.5"
                      fill="url(#seads-seed-grad)"
                      stroke="rgba(255,255,255,.4)"
                      strokeWidth="1"
                      style={{ transformOrigin: "115px 10px", animation: `${group.seedAnim} .26s ease both` }}
                    />
                  </svg>
                  {group.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className="absolute whitespace-nowrap rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3.5 py-1.5 text-[12.5px] font-bold shadow-[0_4px_10px_rgba(0,0,0,.08)]"
                      style={{
                        left: `${child.labelX}px`,
                        top: `${child.labelY}px`,
                        transform: "translate(-50%,-50%)",
                        color: child.color,
                        animation: `${group.labelAnim} .28s ease both`,
                        animationDelay: `${child.delay}s`,
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={`${isMobile ? "hidden" : "flex"} min-w-0 items-center gap-1.5 justify-self-end`}>
          <div className="flex items-center gap-0.5 rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-0.5">
            {locales.map((loc) => (
              <span
                key={loc.code}
                onMouseEnter={() => setHoveredLocale(loc.code)}
                onMouseLeave={() => setHoveredLocale(null)}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => setLocale(loc.code)}
                  aria-label={`${t.switchLanguageTo} ${loc.full}`}
                  className={`rounded-full px-2 py-1.5 text-[11px] font-bold ${loc.active ? "" : "hover:bg-[color:var(--surface-2)]"}`}
                  style={{ background: loc.bg, color: loc.color }}
                >
                  {loc.label}
                </button>
                {loc.showTip && (
                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[60] -translate-x-1/2 whitespace-nowrap rounded-lg bg-[color:var(--foreground)] px-2.5 py-1.5 text-[11px] font-semibold text-[color:var(--background)]">
                    {loc.full}
                  </span>
                )}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t.themeToggleToLight : t.themeToggleToDark}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] text-[15px] leading-none text-[color:var(--foreground)] hover:border-[color:var(--brand)]"
          >
            {themeIcon}
          </button>
          <Link
            href="/join"
            className="rounded-full bg-[color:var(--brand)] px-4.5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? t.navMenuToggleClose : t.navMenuToggleOpen}
          aria-expanded={menuOpen}
          aria-controls="seads-mobile-menu"
          className={`${isMobile ? "flex" : "hidden"} h-[38px] w-[38px] flex-col items-center justify-center gap-1 rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] justify-self-end hover:border-[color:var(--brand)]`}
        >
          <span className="h-0.5 w-4 rounded-sm bg-[color:var(--foreground)]" />
          <span className="h-0.5 w-4 rounded-sm bg-[color:var(--foreground)]" />
        </button>
      </div>

      {menuOpen && (
        <div id="seads-mobile-menu" className="flex flex-col gap-1 border-t border-[color:var(--foreground-soft)] bg-[color:var(--background)] px-6 pb-5.5 pt-4">
          {navGroups.map((group) => (
            <div key={group.key}>
              <Link
                href={group.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3.5 py-3 text-[15px] font-bold hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)]"
                style={{ color: group.color }}
              >
                <svg width="10" height="15" viewBox="0 0 16 22" className="shrink-0">
                  <path d="M8 1 C 12.5 6, 12.5 16, 8 21 C 3.5 16, 3.5 6, 8 1 Z" fill={group.petalColor} />
                </svg>
                {group.label}
              </Link>
              {group.hasChildren && (
                <div className="flex flex-col gap-0.5 pl-[30px]">
                  {group.children.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3.5 py-2.5 text-sm font-semibold hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)]"
                      style={{ color: child.mobileColor }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] p-0.5">
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  type="button"
                  onClick={() => setLocale(loc.code)}
                  aria-label={`${t.switchLanguageTo} ${loc.full}`}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] font-bold ${loc.active ? "" : "hover:bg-[color:var(--surface-2)]"}`}
                  style={{ background: loc.bg, color: loc.color }}
                >
                  {loc.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t.themeToggleToLight : t.themeToggleToDark}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--brand)]"
            >
              {themeIcon}
            </button>
            <Link
              href="/join"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-[color:var(--brand)] px-4.5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
