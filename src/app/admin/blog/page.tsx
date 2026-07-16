import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { AdminTranslations, TranslationField } from "@/components/admin-translations";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { updateStory, createStory, deleteStory } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type Story = {
  slug: string;
  category: Record<string, string>;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  body: Record<string, string[]>;
  photo?: string;
};

async function getStories(): Promise<{ stories: Story[]; error: boolean }> {
  const res = await internalApiFetch("/internal/stories");
  if (!res.ok) return { stories: [], error: true };
  const data = await res.json();
  return { stories: data.stories ?? [], error: false };
}

export default async function AdminBlogPage() {
  const { stories, error } = await getStories();

  return (
    <AdminShell
      title="Blog stories"
      subtitle="These are the staff-authored stories on /blog — separate from the community submissions under Story submissions. New entries start with English text in every language — open a story's Translations section to provide 中文/Melayu/हिन्दी versions."
    >
      <div className="flex flex-col gap-4">
        {stories.map((story) => (
          <form key={story.slug} action={updateStory} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <input type="hidden" name="slug" value={story.slug} />
            <div className="flex items-center justify-between sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">{story.slug}</p>
              <a
                href={`/blog/${story.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]"
              >
                View on site ↗
              </a>
            </div>
            <label className="text-sm text-[color:var(--foreground)]">
              Title (EN)
              <input
                name="titleEn"
                defaultValue={story.title?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Category (EN)
              <input
                name="categoryEn"
                defaultValue={story.category?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Excerpt (EN)
              <input
                name="excerptEn"
                defaultValue={story.excerpt?.en}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
              Body (EN) — one paragraph per line
              <textarea
                name="bodyEn"
                defaultValue={story.body?.en?.join("\n")}
                rows={6}
                className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              />
            </label>
            <div className="sm:col-span-2">
              <AdminImageUpload name="photo" label="Photo" defaultValue={story.photo} />
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
                  <TranslationField base="title" suffix={suffix} label={`Title (${lang})`} defaultValue={story.title?.[suffix.toLowerCase()]} />
                  <TranslationField base="category" suffix={suffix} label={`Category (${lang})`} defaultValue={story.category?.[suffix.toLowerCase()]} />
                  <TranslationField base="excerpt" suffix={suffix} label={`Excerpt (${lang})`} defaultValue={story.excerpt?.[suffix.toLowerCase()]} textarea />
                  <TranslationField
                    base="body"
                    suffix={suffix}
                    label={`Body (${lang})`}
                    defaultValue={story.body?.[suffix.toLowerCase()]?.join("\n")}
                    textarea
                  />
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
                formAction={deleteStory}
                confirmMessage={`Delete ${story.title?.en}? This can't be undone.`}
                className="rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[#e2965f] hover:text-[#e2965f]"
              >
                Delete
              </ConfirmSubmitButton>
            </div>
          </form>
        ))}
        {error && <AdminFetchError />}
        {!error && stories.length === 0 && <p className="text-sm text-[color:var(--muted)]">No stories yet.</p>}
      </div>

      <div className="mt-10">
        <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Add a new story</h2>
        <form action={createStory} className="section-card grid gap-3 p-5 sm:grid-cols-2">
          <label className="text-sm text-[color:var(--foreground)]">
            Title (EN)
            <input
              name="titleEn"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)]">
            Category (EN)
            <input
              name="categoryEn"
              required
              placeholder="e.g. Education"
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Excerpt (EN)
            <input
              name="excerptEn"
              required
              className="mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm text-[color:var(--foreground)] sm:col-span-2">
            Body (EN) — one paragraph per line
            <textarea
              name="bodyEn"
              required
              rows={6}
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
            Add story
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
