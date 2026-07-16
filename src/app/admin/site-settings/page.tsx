import { internalApiFetch } from "@/lib/internal-api";
import { AdminShell } from "@/components/admin-shell";
import { AdminImageUpload } from "@/components/admin-image-upload";
import { AdminFetchError } from "@/components/admin-fetch-error";
import { updateDonateConfig, updateSocialConfig, updateAnnouncementConfig } from "./actions";

// See admin/events/page.tsx for why this must be force-dynamic.
export const dynamic = "force-dynamic";

type SiteConfig = {
  donate: { enabled?: boolean; qrImage?: string; payNowId?: string; instructions?: string } | null;
  social: { instagram?: string; tiktok?: string; linkedin?: string; facebook?: string; youtube?: string } | null;
  announcement: { enabled?: boolean; message?: string; linkUrl?: string; linkLabel?: string } | null;
};

async function getConfig(): Promise<{ config: SiteConfig; error: boolean }> {
  const res = await internalApiFetch("/internal/site-content");
  if (!res.ok) return { config: { donate: null, social: null, announcement: null }, error: true };
  const data = await res.json();
  return { config: { donate: data.donate, social: data.social, announcement: data.announcement }, error: false };
}

const inputClass = "mt-1 w-full rounded-lg border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-3 py-2 text-sm";
const saveClass = "justify-self-start rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--brand-deep)]";

export default async function AdminSiteSettingsPage() {
  const { config, error } = await getConfig();

  return (
    <AdminShell title="Site settings" subtitle="Donation details, social media links, and the site-wide announcement banner.">
      {error && <AdminFetchError />}

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Donations (PayNow)</h2>
          <form action={updateDonateConfig} className="section-card grid gap-3 p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
              <input type="checkbox" name="enabled" defaultChecked={config.donate?.enabled ?? false} className="h-4 w-4" />
              Show donation details on the public /donate page
            </label>
            <p className="text-xs text-[color:var(--muted)]">
              While unchecked, /donate keeps showing &ldquo;donations opening soon&rdquo; — you can fill everything in first and
              flip this on when ready.
            </p>
            <label className="text-sm text-[color:var(--foreground)]">
              PayNow ID (UEN or mobile number)
              <input name="payNowId" defaultValue={config.donate?.payNowId} placeholder="e.g. 202412345A" className={inputClass} />
            </label>
            <AdminImageUpload name="qrImage" label="PayNow QR code (export it from your bank app)" defaultValue={config.donate?.qrImage} />
            <label className="text-sm text-[color:var(--foreground)]">
              Extra instructions (optional)
              <textarea
                name="instructions"
                rows={2}
                defaultValue={config.donate?.instructions}
                placeholder='e.g. "Please include your name as the reference."'
                className={inputClass}
              />
            </label>
            <button type="submit" className={saveClass}>
              Save donation settings
            </button>
          </form>
        </section>

        <section>
          <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Social media links</h2>
          <form action={updateSocialConfig} className="section-card grid gap-3 p-5 sm:grid-cols-2">
            <p className="text-xs text-[color:var(--muted)] sm:col-span-2">
              Full profile URLs. Only filled-in platforms appear in the site footer — leave a field empty to hide that icon.
            </p>
            {(
              [
                ["instagram", "Instagram"],
                ["tiktok", "TikTok"],
                ["linkedin", "LinkedIn"],
                ["facebook", "Facebook"],
                ["youtube", "YouTube"],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="text-sm text-[color:var(--foreground)]">
                {label}
                <input
                  name={field}
                  type="url"
                  defaultValue={config.social?.[field]}
                  placeholder={`https://${field === "linkedin" ? "www.linkedin.com/company/..." : `www.${field}.com/...`}`}
                  className={inputClass}
                />
              </label>
            ))}
            <button type="submit" className={`${saveClass} sm:col-span-2`}>
              Save social links
            </button>
          </form>
        </section>

        <section>
          <h2 className="font-display mb-3 text-lg text-[color:var(--foreground)]">Announcement banner</h2>
          <form action={updateAnnouncementConfig} className="section-card grid gap-3 p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
              <input type="checkbox" name="enabled" defaultChecked={config.announcement?.enabled ?? false} className="h-4 w-4" />
              Show the banner at the top of every public page
            </label>
            <label className="text-sm text-[color:var(--foreground)]">
              Message
              <input
                name="message"
                defaultValue={config.announcement?.message}
                placeholder='e.g. "Volunteer applications for 2027 are now open!"'
                className={inputClass}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-[color:var(--foreground)]">
                Link URL (optional)
                <input name="linkUrl" defaultValue={config.announcement?.linkUrl} placeholder="/join" className={inputClass} />
              </label>
              <label className="text-sm text-[color:var(--foreground)]">
                Link label (optional)
                <input name="linkLabel" defaultValue={config.announcement?.linkLabel} placeholder="Apply now" className={inputClass} />
              </label>
            </div>
            <p className="text-xs text-[color:var(--muted)]">
              Visitors can dismiss the banner; editing the message shows it again to everyone, including people who dismissed the
              old one.
            </p>
            <button type="submit" className={saveClass}>
              Save announcement
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
