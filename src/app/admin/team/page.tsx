import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { AdminTranslations, TranslationField } from "@/components/admin-translations";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { updateTeamMember, createTeamMember, deleteTeamMember } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type TeamMember = {
  slug: string;
  name: string;
  role: Record<string, string>;
  bio: Record<string, string>;
  photo?: string;
  order?: number;
};

async function getTeam(): Promise<{ team: TeamMember[]; error: boolean }> {
  const res = await internalApiFetch("/internal/team");
  if (!res.ok) return { team: [], error: true };
  const data = await res.json();
  return { team: data.team ?? [], error: false };
}

export default async function AdminTeamPage() {
  const { team, error } = await getTeam();

  return (
    <AdminShell
      title="Team"
      subtitle="Team member bios shown on /team. New entries start with English text in every language — open a member's Translations section to provide 中文/Melayu/हिन्दी versions."
    >
      <div className="flex flex-col gap-4">
        {team.map((member) => (
          <form key={member.slug} action={updateTeamMember} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <input type="hidden" name="slug" value={member.slug} />
            <div className="flex items-center justify-between sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{member.slug}</p>
              <a
                href="/team"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]"
              >
                View on site ↗
              </a>
            </div>
            <label className="text-sm text-[color:var(--foreground)]">
              Name
              <input
                name="name"
                defaultValue={member.name}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Order (lower shows first)
              <input
                type="number"
                name="order"
                defaultValue={member.order ?? 0}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Role (EN)
              <input
                name="roleEn"
                defaultValue={member.role?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Bio (EN)
              <textarea
                name="bioEn"
                defaultValue={member.bio?.en}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <AdminImageUpload name="photo" label="Photo" defaultValue={member.photo} />
            </div>
            <AdminTranslations>
              {(
                [
                  ["Zh", "中文"],
                  ["Ms", "Bahasa Melayu"],
                  ["Hi", "हिन्दी"],
                ] as const
              ).map(([suffix, lang]) => (
                <div key={suffix} className="grid gap-3 sm:grid-cols-2">
                  <TranslationField base="role" suffix={suffix} label={`Role (${lang})`} defaultValue={member.role?.[suffix.toLowerCase()]} />
                  <TranslationField base="bio" suffix={suffix} label={`Bio (${lang})`} defaultValue={member.bio?.[suffix.toLowerCase()]} textarea />
                </div>
              ))}
            </AdminTranslations>
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
              >
                Save
              </button>
              <ConfirmSubmitButton
                formAction={deleteTeamMember}
                confirmMessage={`Delete ${member.name}? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && team.length === 0 && <p className="text-sm text-[color:var(--muted)]">No team members yet.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a new team member</h2>
        <form action={createTeamMember} className="section-card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-sm text-[color:var(--foreground)]">
            Name
            <input
              name="name"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Role (EN)
            <input
              name="roleEn"
              required
              placeholder="e.g. Programs Lead"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Bio (EN)
            <textarea
              name="bioEn"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <AdminImageUpload name="photo" label="Photo" />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]"
          >
            Add team member
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
