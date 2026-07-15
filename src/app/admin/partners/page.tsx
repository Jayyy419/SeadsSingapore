import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { updatePartner, createPartner, deletePartner } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type Partner = {
  slug: string;
  name: string;
  logo?: string;
  website?: string;
};

async function getPartners(): Promise<Partner[]> {
  const res = await internalApiFetch("/internal/partners");
  if (!res.ok) return [];
  const data = await res.json();
  return data.partners ?? [];
}

export default async function AdminPartnersPage() {
  const partners = await getPartners();

  return (
    <AdminShell title="Partners" subtitle="Partner organizations shown on the /partners page. Names aren't localized — they're proper nouns.">
      <div className="flex flex-col gap-4">
        {partners.map((partner) => (
          <form key={partner.slug} action={updatePartner} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <input type="hidden" name="slug" value={partner.slug} />
            <label className="text-sm text-[color:var(--foreground)]">
              Name
              <input
                name="name"
                defaultValue={partner.name}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Website (optional)
              <input
                name="website"
                type="url"
                defaultValue={partner.website}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <AdminImageUpload name="logo" label="Logo" defaultValue={partner.logo} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              >
                Save
              </button>
              <button
                type="submit"
                formAction={deletePartner}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </button>
            </div>
          </form>
        ))}
        {partners.length === 0 && <p className="text-sm text-[color:var(--muted)]">No partners yet.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a new partner</h2>
        <form action={createPartner} className="section-card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-sm text-[color:var(--foreground)]">
            Name
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Website (optional)
            <input
              name="website"
              type="url"
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <AdminImageUpload name="logo" label="Logo" />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add partner
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
