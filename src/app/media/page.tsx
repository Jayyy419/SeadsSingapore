import { SiteShell } from "@/components/site-shell";
import { MediaMasonry } from "@/components/media-masonry";

export default function MediaPage() {
  return (
    <SiteShell
      title="Media"
      subtitle="Moments from our programs, events, and youth-led community action across Singapore."
    >
      <section className="section-card bg-[color:var(--surface-2)]/70 p-5 sm:p-7" data-reveal>
        <div className="mb-4">
          <h2 className="font-display text-3xl">Photo Gallery</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Click any image to open fullscreen.
          </p>
        </div>
        <MediaMasonry showFilter />
      </section>
    </SiteShell>
  );
}
