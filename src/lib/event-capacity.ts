import type { EventItem } from "@/content/siteContent";
import type { Translation } from "@/content/i18n";

// spotsFilled is now live (from real RSVP submissions via the interest-form Lambda's public
// /event-rsvp-counts endpoint), not siteContent.ts's old manually-maintained field. Falls
// back to that static field only while the live fetch hasn't resolved yet, so the page never
// shows nothing while loading.
export function eventCapacityLabel(event: EventItem, t: Translation, liveSpotsFilled?: number): string | null {
  if (event.capacity == null) return null;
  const spotsFilled = liveSpotsFilled ?? event.spotsFilled;
  if (spotsFilled == null) return null;
  if (spotsFilled >= event.capacity) return t.waitlistLabel;
  return `${spotsFilled} / ${event.capacity} ${t.spotsFilledUnit}`;
}

export function isEventFull(event: EventItem, liveSpotsFilled?: number): boolean {
  if (event.capacity == null) return false;
  const spotsFilled = liveSpotsFilled ?? event.spotsFilled;
  return spotsFilled != null && spotsFilled >= event.capacity;
}
