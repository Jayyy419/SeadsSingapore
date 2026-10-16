"use client";

import { teamMembers as staticTeam, type TeamMember } from "@/content/siteContent";
import { usePublicList } from "@/lib/public-data-context";

// Same pattern as useEvents() — see usePublicList.
export function useTeam(): { team: TeamMember[]; loaded: boolean } {
  const { items, loaded } = usePublicList<TeamMember>("team", "team", staticTeam);
  return { team: items, loaded };
}
