"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { translations, type Locale, type Translation } from "@/content/i18n";

const LOCALE_KEY = "seads-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Matches navigator.languages (e.g. "zh-SG", "en-US") against our supported locales by
// 2-letter prefix, in the browser's own preference order. Only consulted when there's no
// stored choice yet — once someone picks a locale (including implicitly via this detection),
// LOCALE_KEY takes over and this never runs again for them.
function detectBrowserLocale(): Locale | null {
  for (const lang of window.navigator.languages ?? [window.navigator.language]) {
    const prefix = lang.slice(0, 2).toLowerCase();
    const match = (Object.keys(translations) as Locale[]).find((locale) => locale === prefix);
    if (match) return match;
  }
  return null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Starts at the SSR-safe default ("en", matching what the server rendered, since
  // localStorage isn't available at build/render time) and gets corrected — if needed — by a
  // real post-mount setState below. See site-header.tsx's original comment for why a lazy
  // useState initializer reading localStorage instead would silently break on first load.
  const [locale, setLocaleState] = useState<Locale>("en");

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_KEY) as Locale | null;
    const resolved = (stored && translations[stored] ? stored : null) ?? detectBrowserLocale() ?? "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- correcting from the SSR-safe default, not derived state
    setLocaleState(resolved);
  }, []);

  // Keeps the <html lang> attribute (set statically to "en" in layout.tsx, since the server
  // has no way to know a client's stored preference before first paint) in sync with the
  // active locale for assistive tech and search engines — every one of our locale codes
  // (en/zh/ms/hi) is already a valid standalone BCP 47 language tag, so no mapping is needed.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
  };

  return <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale() must be used within a LocaleProvider");
  return ctx;
}
