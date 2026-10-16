"use client";

import { usePublicList } from "@/lib/public-data-context";

export type Partner = {
  slug: string;
  name: string;
  logo?: string;
  website?: string;
};

const NO_PARTNERS: Partner[] = [];

// No static seed here (unlike useEvents/useTeam) — there's no existing partner list to fall
// back to, since partner records didn't exist anywhere before this feature. Starts empty, and
// an empty live list is a real answer rather than a reason to keep a fallback.
export function usePartners(): { partners: Partner[]; loaded: boolean } {
  const { items, loaded } = usePublicList<Partner>("partners", "partners", NO_PARTNERS, { allowEmpty: true });
  return { partners: items, loaded };
}
