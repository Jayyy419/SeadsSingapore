"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

// Copy-link + WhatsApp + (where supported) the native share sheet — readers previously had
// no way to pass a story along short of copying the address bar by hand. Reads the URL at
// click time rather than render time, so it needs no props and never mismatches hydration.
export function ShareButtons({ title }: { title: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const pageUrl = () => window.location.href;
  const buttonClass =
    "inline-block rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]";

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className={buttonClass}
        onClick={() => {
          navigator.clipboard?.writeText(pageUrl()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
      >
        {copied ? t.copiedLabel : t.copyLinkLabel}
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={() => {
          const url = pageUrl();
          if (navigator.share) {
            navigator.share({ title, url }).catch(() => {});
          } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`, "_blank", "noopener");
          }
        }}
      >
        {t.shareLabel}
      </button>
    </div>
  );
}
