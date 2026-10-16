"use client";

import { stories as staticStories, type Story } from "@/content/siteContent";
import { usePublicList } from "@/lib/public-data-context";

// Same pattern as useEvents()/useTeam()/usePrograms() — see usePublicList.
export function useStories(): { stories: Story[]; loaded: boolean } {
  const { items, loaded } = usePublicList<Story>("stories", "stories", staticStories);
  return { stories: items, loaded };
}
