import type { EventItem } from "@/content/siteContent";
import type { Translation } from "@/content/i18n";

export function eventCapacityLabel(event: EventItem, t: Translation): string | null {
  if (event.capacity == null || event.spotsFilled == null) return null;
  if (event.spotsFilled >= event.capacity) return t.waitlistLabel;
  return `${event.spotsFilled} / ${event.capacity} ${t.spotsFilledUnit}`;
}

export function isEventFull(event: EventItem): boolean {
  return event.capacity != null && event.spotsFilled != null && event.spotsFilled >= event.capacity;
}
