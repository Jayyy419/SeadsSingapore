"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { mediaItems, type MediaItem } from "@/content/media";

type MediaMasonryProps = {
  limit?: number;
  showFilter?: boolean;
};

const allCategory = "All" as const;
type Category = typeof allCategory | MediaItem["category"];

const TRANSITION_MS = 450;
const STAGGER_MS = 40;
const GAP = 14;
const HEIGHTS = [260, 340, 200, 300, 380, 240, 320, 260, 220, 360, 280, 300];

type Photo = MediaItem & { id: number; h: number };

type Position = { left: number; top: number };
type Rect = Position & { width: number; height: number };

function computeMasonry(items: Photo[], maxColCount: number, colWidth: number, gap: number) {
  const colCount = Math.max(1, Math.min(maxColCount, items.length || 1));
  const colHeights = new Array(colCount).fill(0);
  const positions: Record<number, Position> = {};
  items.forEach((p) => {
    let col = 0;
    for (let c = 1; c < colCount; c++) if (colHeights[c] < colHeights[col]) col = c;
    positions[p.id] = { left: col * (colWidth + gap), top: colHeights[col] };
    colHeights[col] += p.h + gap;
  });
  const height = Math.max(0, Math.max(...colHeights) - gap);
  return { positions, height };
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function MediaMasonry({ limit, showFilter = true }: MediaMasonryProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(allCategory);
  const [lightboxId, setLightboxId] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());
  const [leavingRects, setLeavingRects] = useState<Record<number, Rect>>({});
  const [enteringIds, setEnteringIds] = useState<Set<number>>(new Set());

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const photosBase = useMemo<Photo[]>(
    () => mediaItems.map((item, i) => ({ ...item, id: i, h: HEIGHTS[i % HEIGHTS.length] })),
    [],
  );

  const categories = useMemo(() => {
    return [allCategory, ...Array.from(new Set(photosBase.map((p) => p.category)))];
  }, [photosBase]);

  const matches = (p: Photo, category: Category) => category === allCategory || p.category === category;

  const matching = useMemo(() => {
    const base = photosBase.filter((p) => matches(p, activeCategory));
    return typeof limit === "number" ? base.slice(0, limit) : base;
  }, [photosBase, activeCategory, limit]);
  const matchingIds = useMemo(() => new Set(matching.map((p) => p.id)), [matching]);

  useLayoutEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth;
      if (w) setContainerWidth((prev) => (Math.abs(w - prev) > 2 ? w : prev));
    };
    measure();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial mount-in animation, not derived state
    setEnteringIds(new Set(matching.map((p) => p.id)));
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colCount = containerWidth >= 1000 ? 4 : containerWidth >= 700 ? 3 : containerWidth >= 460 ? 2 : 1;
  const colWidth = (containerWidth - GAP * (colCount - 1)) / colCount;
  const layout = useMemo(
    () => computeMasonry(matching, colCount, colWidth, GAP),
    [matching, colCount, colWidth],
  );

  function setCategory(next: Category) {
    if (next === activeCategory) return;

    const prevMatching = photosBase.filter((p) => matches(p, activeCategory)).slice(0, limit ?? undefined);
    const prevLayout = computeMasonry(prevMatching, colCount, colWidth, GAP);
    const nextMatching = photosBase.filter((p) => matches(p, next)).slice(0, limit ?? undefined);
    const nextIds = new Set(nextMatching.map((p) => p.id));

    const toLeave = prevMatching.filter((p) => !nextIds.has(p.id));
    const newLeavingRects: Record<number, Rect> = { ...leavingRects };
    toLeave.forEach((p) => {
      const pos = prevLayout.positions[p.id];
      newLeavingRects[p.id] = { left: pos.left, top: pos.top, width: colWidth, height: p.h };
    });

    const prevIds = new Set(prevMatching.map((p) => p.id));
    const toEnter = nextMatching.filter((p) => !prevIds.has(p.id)).map((p) => p.id);

    setActiveCategory(next);
    setLeavingIds(new Set(toLeave.map((p) => p.id)));
    setLeavingRects(newLeavingRects);
    setEnteringIds(new Set(toEnter));

    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setLeavingIds(new Set()), TRANSITION_MS);
    if (enterTimer.current) clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => setEnteringIds(new Set()), TRANSITION_MS + 50);
  }

  const lightboxItem = lightboxId !== null ? photosBase.find((p) => p.id === lightboxId) : null;
  const reduceMotion = prefersReducedMotion();

  useEffect(() => {
    if (lightboxId === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxId]);

  return (
    <div className="space-y-4">
      {showFilter && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setCategory(category)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                    : "border-[color:var(--foreground-soft)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:border-[color:var(--brand)]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative"
        style={{ height: layout.height, transition: `height ${TRANSITION_MS}ms cubic-bezier(.4,0,.2,1)` }}
      >
        {photosBase.map((photo) => {
          const isMatching = matchingIds.has(photo.id);
          const isLeaving = leavingIds.has(photo.id);
          const isEntering = enteringIds.has(photo.id) && !reduceMotion;

          if (isMatching) {
            const pos = layout.positions[photo.id];
            if (!pos) return null;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxId(photo.id)}
                className="group absolute overflow-hidden rounded-2xl border border-[color:var(--foreground-soft)] text-left"
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: colWidth,
                  height: photo.h,
                  zIndex: 1,
                  transition: `left ${TRANSITION_MS}ms cubic-bezier(.4,0,.2,1), top ${TRANSITION_MS}ms cubic-bezier(.4,0,.2,1), width ${TRANSITION_MS}ms cubic-bezier(.4,0,.2,1)`,
                  animation: isEntering
                    ? `seads-masonry-bounce-in ${TRANSITION_MS}ms cubic-bezier(.34,1.56,.64,1) backwards`
                    : undefined,
                  animationDelay: isEntering ? `${(photo.id % colCount) * STAGGER_MS}ms` : undefined,
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#ffd9b3]">{photo.category}</p>
                  <p className="mt-0.5 text-sm text-white">{photo.caption}</p>
                </div>
              </button>
            );
          }

          if (isLeaving && leavingRects[photo.id]) {
            const rect = leavingRects[photo.id];
            return (
              <div
                key={photo.id}
                className="absolute overflow-hidden rounded-2xl border border-[color:var(--foreground-soft)]"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  zIndex: 0,
                  opacity: 0,
                  transform: "scale(0.9)",
                  pointerEvents: "none",
                  transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
                }}
              >
                <Image src={photo.src} alt={photo.caption} fill sizes="33vw" className="object-cover" />
              </div>
            );
          }

          return null;
        })}
      </div>

      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxId(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-[color:var(--inverse-bg)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 text-white">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">{lightboxItem.category}</p>
                <p className="text-sm font-semibold">{lightboxItem.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxId(null)}
                className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/90 hover:border-white/50 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="relative h-[78vh] w-full">
              <Image src={lightboxItem.src} alt={lightboxItem.caption} fill sizes="90vw" className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
