"use client";

import { events as staticEvents, type EventItem } from "@/content/siteContent";
import { usePublicList } from "@/lib/public-data-context";

// Events moved from siteContent.ts (static) to DynamoDB so admins can create/edit/delete
// them without a code change + deploy — see docs/LEARNING_GUIDE.md. Rendered from the
// server's prefetch when there is one, otherwise the static fallback swapped for the live list
// (see usePublicList). `loaded` distinguishes "still on the static fallback" from "confirmed
// live data" — callers that need to 404 on an unknown slug (e.g. a newly admin-created event
// that isn't in the static fallback) should wait for `loaded` before deciding a slug doesn't
// exist.
export function useEvents(): { events: EventItem[]; loaded: boolean } {
  const { items, loaded } = usePublicList<EventItem>("events", "events", staticEvents);
  return { events: items, loaded };
}
