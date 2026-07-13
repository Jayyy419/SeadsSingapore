"use client";

import { SiteShell } from "@/components/site-shell";
import { useLocale } from "@/lib/locale-context";

/**
 * "hello@seads.sg" and "Cloudflare" appear as literal, untranslated substrings in every
 * locale's copy (an email address and a brand name don't get translated) — so rather than
 * hand-splitting each language's sentence around a link, we find that substring wherever it
 * lands and turn just that piece into a real, clickable link.
 */
function linkify(text: string, needle: string, href: string) {
  const index = text.indexOf(needle);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-[color:var(--brand)] hover:underline">
        {needle}
      </a>
      {text.slice(index + needle.length)}
    </>
  );
}

export function PrivacyContent() {
  const { t } = useLocale();
  const mailto = "mailto:hello@seads.sg";

  return (
    <SiteShell title={t.privacyPageTitle} subtitle={t.privacyLastUpdated}>
      <div className="section-card space-y-8 p-6 sm:p-8">
        <p className="text-sm text-[color:var(--muted)]">{linkify(t.privacyIntro, "hello@seads.sg", mailto)}</p>

        <section>
          <h2 className="font-display text-xl">{t.whatWeCollect}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[color:var(--muted)]">
            <li>
              <strong className="text-[color:var(--foreground)]">{t.collectFormItemLabel}</strong> {t.collectFormItemBody}
            </li>
            <li>
              <strong className="text-[color:var(--foreground)]">{t.collectAnalyticsItemLabel}</strong> {t.collectAnalyticsItemBody}
            </li>
            <li>
              <strong className="text-[color:var(--foreground)]">{t.collectBotItemLabel}</strong>{" "}
              {linkify(t.collectBotItemBody, "Cloudflare", "https://www.cloudflare.com/privacypolicy/")}
            </li>
            <li>
              <strong className="text-[color:var(--foreground)]">{t.collectErrorItemLabel}</strong> {t.collectErrorItemBody}
            </li>
          </ul>
          <p className="mt-4 text-sm text-[color:var(--muted)]">{t.noCookiesNote}</p>
        </section>

        <section>
          <h2 className="font-display text-xl">{t.whyWeCollect}</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{t.whyWeCollectBody}</p>
        </section>

        <section>
          <h2 className="font-display text-xl">{t.whereStored}</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{t.whereStoredBody}</p>
        </section>

        <section>
          <h2 className="font-display text-xl">{t.howLongKept}</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{t.howLongKeptBody}</p>
        </section>

        <section>
          <h2 className="font-display text-xl">{t.yourRights}</h2>
          <p className="mt-3 text-sm text-[color:var(--muted)]">{linkify(t.yourRightsBody, "hello@seads.sg", mailto)}</p>
        </section>
      </div>
    </SiteShell>
  );
}
