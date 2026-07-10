"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { mediaItems, type MediaItem } from "@/content/media";

type MediaMasonryProps = {
  limit?: number;
  showFilter?: boolean;
};

const allCategory = "All" as const;

type Category = typeof allCategory | MediaItem["category"];

export function MediaMasonry({ limit, showFilter = true }: MediaMasonryProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(allCategory);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    return [allCategory, ...Array.from(new Set(mediaItems.map((item) => item.category)))];
  }, []);

  const filtered = useMemo(() => {
    const base =
      activeCategory === allCategory
        ? mediaItems
        : mediaItems.filter((item) => item.category === activeCategory);
    return typeof limit === "number" ? base.slice(0, limit) : base;
  }, [activeCategory, limit]);

  const openItem = openIndex !== null ? filtered[openIndex] : null;

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
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                    : "border-[color:var(--foreground-soft)] bg-white text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filtered.map((item, index) => (
          <figure
            key={`${item.src}-${item.date}-${index}`}
            className="mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-[color:var(--foreground-soft)] bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="block w-full text-left"
            >
              <Image
                src={item.src}
                alt={item.caption}
                width={1200}
                height={720}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full object-cover"
              />
            </button>
            <figcaption className="space-y-1 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[color:var(--brand)]">
                {item.category}
              </p>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.caption}</p>
              <time className="text-xs text-[color:var(--muted)]">{item.date}</time>
            </figcaption>
          </figure>
        ))}
      </div>

      {openItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/20 bg-[color:var(--inverse-bg)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 text-white">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">{openItem.category}</p>
                <p className="text-sm font-semibold">{openItem.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/90"
              >
                Close
              </button>
            </div>
            <Image
              src={openItem.src}
              alt={openItem.caption}
              width={1200}
              height={720}
              sizes="90vw"
              className="max-h-[78vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
