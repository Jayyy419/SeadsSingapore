export type Submission = { submittedAt: string; interestType?: string; eventSlug?: string };
export type EventItem = { slug: string; title?: Record<string, string>; capacity?: number; rsvpCount?: number };
export type StorySubmission = { status?: string; submittedAt: string };

// Last `days` calendar days (including today), oldest first, zero-filled so a quiet day shows
// as a real bar rather than a gap — a sparse array would make the chart's x-axis lie about
// spacing.
export function submissionsByDay(submissions: Submission[], days = 30): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of submissions) {
    const day = s.submittedAt?.slice(0, 10);
    if (day) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const result: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

export function interestTypeCounts(submissions: Submission[]): { type: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of submissions) {
    const type = s.interestType || "(unspecified)";
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return [...counts.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
}

export function eventFillRates(events: EventItem[]): { slug: string; title: string; rsvpCount: number; capacity: number | null; percent: number | null }[] {
  return events
    .map((e) => {
      const rsvpCount = e.rsvpCount ?? 0;
      const capacity = typeof e.capacity === "number" ? e.capacity : null;
      return {
        slug: e.slug,
        title: e.title?.en || e.slug,
        rsvpCount,
        capacity,
        percent: capacity ? Math.min(100, Math.round((rsvpCount / capacity) * 100)) : null,
      };
    })
    .sort((a, b) => b.rsvpCount - a.rsvpCount);
}

export function storyStatusCounts(stories: StorySubmission[]): { pending: number; approved: number; rejected: number } {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const s of stories) {
    if (s.status === "pending" || s.status === "approved" || s.status === "rejected") counts[s.status]++;
  }
  return counts;
}
