"use client";

import { useEffect, useState } from "react";
import { stories as staticStories, type Story } from "@/content/siteContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

// Same pattern as useEvents()/useTeam()/usePrograms() — see docs/LEARNING_GUIDE.md.
export function useStories(): { stories: Story[]; loaded: boolean } {
  const [stories, setStories] = useState<Story[]>(staticStories);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/stories`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.stories?.length) setStories(data.stories);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { stories, loaded };
}
