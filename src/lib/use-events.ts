"use client";

import { useEffect, useState } from "react";
import { events as staticEvents, type EventItem } from "@/content/siteContent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

// Events moved from siteContent.ts (static) to DynamoDB so admins can create/edit/delete
// them without a code change + deploy — see docs/LEARNING_GUIDE.md. Renders the static
// fallback immediately (no loading flash, and a graceful degrade if the fetch fails), then
// swaps in the live list once it arrives. `loaded` distinguishes "still on the static
// fallback" from "confirmed live data" — callers that need to 404 on an unknown slug (e.g. a
// newly admin-created event that isn't in the static fallback) should wait for `loaded`
// before deciding a slug doesn't exist.
export function useEvents(): { events: EventItem[]; loaded: boolean } {
  const [events, setEvents] = useState<EventItem[]>(staticEvents);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/events`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.events?.length) setEvents(data.events);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { events, loaded };
}
