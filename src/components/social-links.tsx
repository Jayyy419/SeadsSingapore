"use client";

import { useSiteContent } from "@/lib/use-site-content";
import { useLocale } from "@/lib/locale-context";
import { isSafeUrl } from "@/lib/safe-url";

// Minimal single-path glyphs so no icon library is needed — each is the platform's
// widely-recognized mark simplified to one filled path.
const ICON_PATHS: Record<string, string> = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 2.1c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.7.3-.4.2-.6.3-.9.6-.3.3-.5.5-.6.9-.1.2-.2.6-.3 1.7-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.7.2.4.3.6.6.9.3.3.5.5.9.6.2.1.6.2 1.7.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.7-.3.4-.2.6-.3.9-.6.3-.3.5-.5.6-.9.1-.2.2-.6.3-1.7.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.7-.2-.4-.3-.6-.6-.9-.3-.3-.5-.5-.9-.6-.2-.1-.6-.2-1.7-.3-1.3-.1-1.7-.1-4.8-.1zm0 3.6a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2zm0 2.1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.3-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z",
  tiktok:
    "M16.7 2h-3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.5a6 6 0 0 0-.9-.1 6 6 0 1 0 6 6V8.8a7.5 7.5 0 0 0 4.4 1.4v-3a4.5 4.5 0 0 1-4.5-4.5V2z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9z",
  facebook:
    "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z",
  youtube:
    "M23 12s0-3.9-.5-5.6a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2C1 8.1 1 12 1 12s0 3.9.5 5.6c.3 1 1 1.7 2 2 1.8.4 8.5.4 8.5.4s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2c.5-1.7.5-5.6.5-5.6zM9.8 15.5v-7l6 3.5-6 3.5z",
};

// Renders only the platforms the org has actually configured in /admin/site-settings —
// nothing at all until at least one URL is set, so the footer doesn't show dead icons.
export function SocialLinks({ className }: { className?: string }) {
  const { social } = useSiteContent();
  const { t } = useLocale();

  const links = (["instagram", "tiktok", "linkedin", "facebook", "youtube"] as const)
    .map((platform) => ({ platform, url: social?.[platform] }))
    .filter((l): l is { platform: (typeof l)["platform"]; url: string } => isSafeUrl(l.url));

  if (links.length === 0) return null;

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--footer-muted)]">{t.followUs}</p>
      <div className="mt-2 flex gap-3">
        {links.map(({ platform, url }) => (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform}
            className="text-[color:var(--footer-muted)] transition hover:text-[color:var(--footer-fg)]"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d={ICON_PATHS[platform]} />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
