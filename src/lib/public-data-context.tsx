"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { PublicData, PublicEndpoint } from "@/lib/public-data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

const PublicDataContext = createContext<PublicData>({});

export function PublicDataProvider({ data, children }: { data: PublicData; children: React.ReactNode }) {
  return <PublicDataContext.Provider value={data}>{children}</PublicDataContext.Provider>;
}

// The body the server prefetched for this endpoint (see src/lib/public-data.ts), or undefined
// if it didn't — outside production, outside the (site) layout, or because that fetch failed.
export function usePrefetched<T>(endpoint: PublicEndpoint): T | undefined {
  return useContext(PublicDataContext)[endpoint] as T | undefined;
}

// The shared shape behind useEvents/useTeam/usePrograms/useStories/usePartners: render the
// server-prefetched list when there is one — so the first HTML already has real content —
// and otherwise render the bundled fallback and swap in the live list from the browser.
// `loaded` distinguishes "confirmed live data" from "still on the fallback", for callers that
// 404 on an unknown slug. An empty live list keeps the fallback unless `allowEmpty` (there's no
// fallback worth keeping, e.g. partners).
export function usePublicList<T>(endpoint: PublicEndpoint, field: string, fallback: T[], { allowEmpty = false } = {}) {
  const pick = (body: unknown): T[] | null => {
    const list = (body as Record<string, unknown> | null)?.[field];
    return Array.isArray(list) && (allowEmpty || list.length) ? (list as T[]) : null;
  };
  const prefetched = usePrefetched<unknown>(endpoint);
  const [items, setItems] = useState<T[]>(() => (prefetched !== undefined ? pick(prefetched) : null) ?? fallback);
  const [loaded, setLoaded] = useState(prefetched !== undefined);

  useEffect(() => {
    if (prefetched !== undefined) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/${endpoint}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (cancelled) return;
        const list = pick(body);
        if (list) setItems(list);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once per mount, as before
  }, [prefetched, endpoint]);

  return { items, loaded };
}
