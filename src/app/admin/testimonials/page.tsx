import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type Testimonial = {
  itemId: string;
  quote: string;
  author: string;
  roleLabel?: string;
  order?: number;
};

const idOf = (itemId: string) => itemId.split("#")[1] ?? itemId;

async function getTestimonials(): Promise<{ items: Testimonial[]; error: boolean }> {
  const res = await internalApiFetch("/internal/site-content");
  if (!res.ok) return { items: [], error: true };
  const data = await res.json();
  return { items: data.testimonials ?? [], error: false };
}

export default async function AdminTestimonialsPage() {
  const { items, error } = await getTestimonials();

  return (
    <AdminShell
      title="Testimonials"
      subtitle="Quotes shown on the homepage. Until at least one is added here, the site shows its built-in sample quotes."
    >
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <form key={item.itemId} action={updateTestimonial} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <input type="hidden" name="id" value={idOf(item.itemId)} />
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Quote
              <textarea
                name="quote"
                rows={3}
                defaultValue={item.quote}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Author
              <input
                name="author"
                defaultValue={item.author}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Role (optional, e.g. &ldquo;Student Volunteer&rdquo;)
              <input
                name="roleLabel"
                defaultValue={item.roleLabel}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Order (lower shows first)
              <input
                type="number"
                name="order"
                defaultValue={item.order ?? 0}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              >
                Save
              </button>
              <ConfirmSubmitButton
                formAction={deleteTestimonial}
                confirmMessage={`Delete the testimonial from ${item.author}? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && items.length === 0 && (
          <p className="text-sm text-[color:var(--muted)]">No testimonials yet — the homepage is showing built-in samples.</p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a testimonial</h2>
        <form action={createTestimonial} className="section-card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Quote
            <textarea
              name="quote"
              rows={3}
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Author
            <input
              name="author"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Role (optional)
            <input
              name="roleLabel"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add testimonial
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
