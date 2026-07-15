"use client";

import { useEffect, useState } from "react";
import { teamMembers as staticTeam, type TeamMember } from "@/content/siteContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

// Same pattern as useEvents() — see docs/LEARNING_GUIDE.md. Renders the static fallback
// immediately, then swaps in the live DynamoDB-backed list once it arrives.
export function useTeam(): { team: TeamMember[]; loaded: boolean } {
  const [team, setTeam] = useState<TeamMember[]>(staticTeam);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/team`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.team?.length) setTeam(data.team);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { team, loaded };
}
