// Shown when a list page's fetch to the Lambda failed outright (network error, 5xx, timeout)
// rather than genuinely returning zero items — without this, both cases render identically
// ("No X yet."), which could read to an admin as "all my content just disappeared."
export function AdminFetchError() {
  return (
    <p className="rounded-xl border border-[#e2965f] bg-[#e2965f]/10 px-4 py-3 text-sm font-semibold text-[#e2965f]">
      Couldn&apos;t load this list right now — the server may be unreachable. This doesn&apos;t mean your data was deleted; try
      reloading the page.
    </p>
  );
}
