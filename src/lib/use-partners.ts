"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

export type Partner = {
  slug: string;
  name: string;
  logo?: string;
  website?: string;
};

// No static seed here (unlike useEvents/useTeam) — there's no existing partner list to fall
// back to, since partner records didn't exist anywhere before this feature. Starts empty and
// fills in once the live fetch resolves.
export function usePartners(): { partners: Partner[]; loaded: boolean } {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/partners`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.partners) setPartners(data.partners);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { partners, loaded };
}
