import Link from "next/link";

// `extraParams` carries any active filter query (e.g. "q=jane&type=event") so paging doesn't
// silently drop the filters — without it, clicking Next on a filtered view reverts to the
// unfiltered list.
export function AdminPagination({
  page,
  totalPages,
  baseHref,
  extraParams = "",
}: {
  page: number;
  totalPages: number;
  baseHref: string;
  extraParams?: string;
}) {
  if (totalPages <= 1) return null;

  const href = (targetPage: number) => {
    const params = new URLSearchParams(extraParams);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `${baseHref}?${query}` : baseHref;
  };

  const prevHref = page > 1 ? href(page - 1) : null;
  const nextHref = page < totalPages ? href(page + 1) : null;
  const linkClass = "rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]";
  const disabledClass = "rounded-full border border-[color:var(--foreground-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--muted)] opacity-50";

  return (
    <div className="flex items-center justify-between gap-3 p-3 text-sm text-[color:var(--muted)]">
      {prevHref ? (
        <Link href={prevHref} className={linkClass}>
          &larr; Previous
        </Link>
      ) : (
        <span className={disabledClass}>&larr; Previous</span>
      )}
      <span className="text-xs">
        Page {page} of {totalPages}
      </span>
      {nextHref ? (
        <Link href={nextHref} className={linkClass}>
          Next &rarr;
        </Link>
      ) : (
        <span className={disabledClass}>Next &rarr;</span>
      )}
    </div>
  );
}
