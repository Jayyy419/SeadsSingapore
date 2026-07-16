"use client";

import { useEffect, useState } from "react";
import { mediaItems as staticMediaItems } from "@/content/media";
import { testimonials as staticTestimonials } from "@/content/siteContent";
import type { Locale } from "@/content/i18n";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

type LocalizedText = Record<Locale, string>;

export type SiteMediaItem = { itemId?: string; src: string; caption: string; category: string };
export type SiteTestimonial = { itemId?: string; quote: LocalizedText; author: LocalizedText };
export type SiteFaqItem = { itemId: string; question: string; answer: string };
export type DonateConfig = { enabled?: boolean; qrImage?: string; payNowId?: string; instructions?: string } | null;
export type SocialConfig = { instagram?: string; tiktok?: string; linkedin?: string; facebook?: string; youtube?: string } | null;
export type AnnouncementConfig = { enabled?: boolean; message?: string; linkUrl?: string; linkLabel?: string } | null;

export type SiteContent = {
  media: SiteMediaItem[];
  testimonials: SiteTestimonial[];
  faq: SiteFaqItem[];
  donate: DonateConfig;
  social: SocialConfig;
  announcement: AnnouncementConfig;
};

// What GET /site-content actually returns — admin-created testimonials store plain strings
// (there's no per-locale editing for these short quotes), unlike the fully-localized static
// fallbacks.
type RawSiteContent = {
  media?: SiteMediaItem[];
  testimonials?: { itemId: string; quote: string; author: string; roleLabel?: string }[];
  faq?: SiteFaqItem[];
  donate?: DonateConfig;
  social?: SocialConfig;
  announcement?: AnnouncementConfig;
};

// Normalizing live testimonials into the same locale-keyed shape as the static fallbacks lets
// the homepage keep rendering `quote[locale]` without caring which source an item came from.
function toLocalized(text: string): LocalizedText {
  return { en: text, zh: text, ms: text, hi: text };
}

const staticFallback: SiteContent = {
  media: staticMediaItems,
  testimonials: staticTestimonials,
  faq: [],
  donate: null,
  social: null,
  announcement: null,
};

// One /site-content payload feeds several unrelated components on the same page (announcement
// banner, footer social links, homepage testimonials, the gallery…) — this module-level
// promise cache makes them all share a single network request per page load instead of each
// hook instance firing its own.
let cachedFetch: Promise<RawSiteContent | null> | null = null;
function fetchSiteContent(): Promise<RawSiteContent | null> {
  if (!cachedFetch) {
    cachedFetch = fetch(`${API_BASE_URL}/site-content`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);
  }
  return cachedFetch;
}

// Same static-fallback-then-live-swap pattern as useEvents()/useTeam()/etc. — render
// instantly from bundled data, upgrade when the live fetch resolves, degrade gracefully if
// it never does.
export function useSiteContent(): SiteContent & { loaded: boolean } {
  const [content, setContent] = useState<SiteContent>(staticFallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent().then((data) => {
      if (cancelled) return;
      if (data) {
        setContent({
          media: data.media?.length ? data.media : staticFallback.media,
          testimonials: data.testimonials?.length
            ? data.testimonials.map((t) => ({
                itemId: t.itemId,
                quote: toLocalized(t.quote),
                author: toLocalized([t.author, t.roleLabel].filter(Boolean).join(", ")),
              }))
            : staticFallback.testimonials,
          faq: data.faq ?? [],
          donate: data.donate ?? null,
          social: data.social ?? null,
          announcement: data.announcement ?? null,
        });
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...content, loaded };
}
