import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { createFaqItem, updateFaqItem, deleteFaqItem } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type FaqItem = {
  itemId: string;
  question: string;
  answer: string;
  order?: number;
};

const idOf = (itemId: string) => itemId.split("#")[1] ?? itemId;

async function getFaqItems(): Promise<{ items: FaqItem[]; error: boolean }> {
  const res = await internalApiFetch("/internal/site-content");
  if (!res.ok) return { items: [], error: true };
  const data = await res.json();
  return { items: data.faq ?? [], error: false };
}

export default async function AdminFaqPage() {
  const { items, error } = await getFaqItems();

  return (
    <AdminShell title="FAQ" subtitle="Questions and answers shown on the public /faq page.">
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <form key={item.itemId} action={updateFaqItem} className="section-card grid gap-3 p-5">
            <input type="hidden" name="id" value={idOf(item.itemId)} />
            <label className="text-sm text-[color:var(--foreground)]">
              Question
              <input
                name="question"
                defaultValue={item.question}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Answer
              <textarea
                name="answer"
                rows={4}
                defaultValue={item.answer}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Order (lower shows first)
              <input
                type="number"
                name="order"
                defaultValue={item.order ?? 0}
                className="mt-1 w-32 rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              >
                Save
              </button>
              <ConfirmSubmitButton
                formAction={deleteFaqItem}
                confirmMessage={`Delete this FAQ entry ("${item.question}")? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && items.length === 0 && <p className="text-sm text-[color:var(--muted)]">No FAQ entries yet.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a question</h2>
        <form action={createFaqItem} className="section-card grid gap-3 p-5">
          <label className="text-sm text-[color:var(--foreground)]">
            Question
            <input
              name="question"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Answer
            <textarea
              name="answer"
              rows={4}
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            className="justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add question
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
