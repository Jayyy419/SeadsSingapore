"use client";

import { useEffect, useState } from "react";
import { programs as staticPrograms, type Program } from "@/content/siteContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

// Same pattern as useEvents()/useTeam() — see docs/LEARNING_GUIDE.md.
export function usePrograms(): { programs: Program[]; loaded: boolean } {
  const [programs, setPrograms] = useState<Program[]>(staticPrograms);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/programs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.programs?.length) setPrograms(data.programs);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { programs, loaded };
}
