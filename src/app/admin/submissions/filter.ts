export type Submission = {
  id: string;
  name: string;
  email: string;
  interest: string;
  interestType: string;
  eventSlug?: string;
  rsvpStatus?: "confirmed" | "waitlisted";
  submittedAt: string;
};

// Shared by the list page and the CSV export route so the downloaded file always matches
// what's on screen. Lives in its own module because page.tsx files can only export Next.js's
// reserved fields.
export function filterSubmissions(submissions: Submission[], q: string, type: string, eventSlug: string): Submission[] {
  const needle = q.trim().toLowerCase();
  return submissions.filter((s) => {
    if (type && s.interestType !== type) return false;
    if (eventSlug && s.eventSlug !== eventSlug) return false;
    if (needle && !`${s.name} ${s.email} ${s.interest}`.toLowerCase().includes(needle)) return false;
    return true;
  });
}
