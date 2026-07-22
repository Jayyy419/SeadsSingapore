"use client";

import { useEffect, useState } from "react";
import { useSiteContent } from "@/lib/use-site-content";
import { useLocale } from "@/lib/locale-context";
import { isSafeUrl } from "@/lib/safe-url";

// Admin-configurable site-wide banner ("applications open", "Saturday's event moved", …) —
// previously anything like this needed a code change + deploy. Dismissal is remembered in
// localStorage keyed by the message text itself, so editing the message automatically
// re-surfaces the banner for everyone who dismissed the old one.
export function AnnouncementBanner() {
  const { announcement } = useSiteContent();
  const { t } = useLocale();
  const [dismissed, setDismissed] = useState(true);

  const active = announcement?.enabled && announcement.message ? announcement : null;
  const storageKey = active ? `seads-announcement-dismissed:${active.message}` : null;

  useEffect(() => {
    if (!storageKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage is only possible post-mount
    setDismissed(window.localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  if (!active || dismissed) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-[color:var(--brand)] px-4 py-2.5 text-sm text-white">
      <p className="min-w-0">
        {active.message}
        {isSafeUrl(active.linkUrl, { allowRelative: true }) && (
          <a href={active.linkUrl} className="ml-2 font-semibold underline underline-offset-2 hover:opacity-85">
            {active.linkLabel || active.linkUrl}
          </a>
        )}
      </p>
      <button
        type="button"
        aria-label={t.dismissLabel}
        onClick={() => {
          if (storageKey) window.localStorage.setItem(storageKey, "1");
          setDismissed(true);
        }}
        className="shrink-0 rounded-full border border-white/40 px-2 text-xs font-semibold hover:bg-white/10"
      >
        ✕
      </button>
    </div>
  );
}
