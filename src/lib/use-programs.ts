"use client";

import { programs as staticPrograms, type Program } from "@/content/siteContent";
import { usePublicList } from "@/lib/public-data-context";

// Same pattern as useEvents()/useTeam() — see usePublicList.
export function usePrograms(): { programs: Program[]; loaded: boolean } {
  const { items, loaded } = usePublicList<Program>("programs", "programs", staticPrograms);
  return { programs: items, loaded };
}
