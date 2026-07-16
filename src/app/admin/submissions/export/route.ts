import { internalApiFetch } from "@/lib/internal-api";
import { filterSubmissions, type Submission } from "../filter";

// CSV download of the (optionally filtered) submissions list — attendance sheets and contact
// lists previously meant copy-pasting out of the browser table page by page. Lives under
// /admin/* so proxy.ts's session check gates it like every other admin surface.
export const dynamic = "force-dynamic";

// Excel interprets a leading = + - or @ as a formula, so a submission crafted like
// "=HYPERLINK(...)" would execute on open. Prefixing with ' renders it inert as plain text.
function csvCell(value: string): string {
  const deFormulad = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${deFormulad.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const type = url.searchParams.get("type") ?? "";
  const event = url.searchParams.get("event") ?? "";

  const res = await internalApiFetch("/internal/submissions");
  if (!res.ok) {
    return new Response("Could not load submissions", { status: 502 });
  }
  const data = await res.json();
  const submissions = filterSubmissions((data.submissions ?? []) as Submission[], q, type, event);

  const header = ["Submitted", "Name", "Email", "Type", "Event", "RSVP status", "Message"];
  const rows = submissions.map((s) =>
    [s.submittedAt, s.name, s.email, s.interestType ?? "", s.eventSlug ?? "", s.rsvpStatus ?? "", s.interest ?? ""].map(csvCell).join(",")
  );
  const csv = [header.join(","), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="seads-submissions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
