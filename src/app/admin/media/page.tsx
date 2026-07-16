import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { createMediaItem, updateMediaItem, deleteMediaItem } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type MediaItem = {
  itemId: string;
  src: string;
  caption: string;
  category: string;
  order?: number;
};

// itemId is stored as "media#<uuid>" — the actions only need the uuid part.
const idOf = (itemId: string) => itemId.split("#")[1] ?? itemId;

async function getMediaItems(): Promise<{ items: MediaItem[]; error: boolean }> {
  const res = await internalApiFetch("/internal/site-content");
  if (!res.ok) return { items: [], error: true };
  const data = await res.json();
  return { items: data.media ?? [], error: false };
}

export default async function AdminMediaPage() {
  const { items, error } = await getMediaItems();

  return (
    <AdminShell
      title="Media gallery"
      subtitle="Photos shown in the /media gallery and the homepage preview. Until at least one photo is added here, the site shows its built-in placeholder images."
    >
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <form key={item.itemId} action={updateMediaItem} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <input type="hidden" name="id" value={idOf(item.itemId)} />
            <label className="text-sm text-[color:var(--foreground)]">
              Caption
              <input
                name="caption"
                defaultValue={item.caption}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Category
              <input
                name="category"
                defaultValue={item.category}
                placeholder="e.g. Events"
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
            <div className="sm:col-span-2">
              <AdminImageUpload name="src" label="Photo" defaultValue={item.src} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              >
                Save
              </button>
              <ConfirmSubmitButton
                formAction={deleteMediaItem}
                confirmMessage={`Delete this photo ("${item.caption}")? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && items.length === 0 && (
          <p className="text-sm text-[color:var(--muted)]">No gallery photos yet — the public site is showing placeholders.</p>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a photo</h2>
        <form action={createMediaItem} className="section-card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-sm text-[color:var(--foreground)]">
            Caption
            <input
              name="caption"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Category
            <input
              name="category"
              placeholder="e.g. Events"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <AdminImageUpload name="src" label="Photo" />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add photo
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
