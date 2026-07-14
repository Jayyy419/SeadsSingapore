"use client";

import { useEffect, useState } from "react";

export function useEventRsvpCounts(): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) return;

    let cancelled = false;
    fetch(`${baseUrl}/event-rsvp-counts`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.counts) setCounts(data.counts);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}
