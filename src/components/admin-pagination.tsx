import Link from "next/link";

export function AdminPagination({ page, totalPages, baseHref }: { page: number; totalPages: number; baseHref: string }) {
  if (totalPages <= 1) return null;

  const prevHref = page > 1 ? (page - 1 === 1 ? baseHref : `${baseHref}?page=${page - 1}`) : null;
  const nextHref = page < totalPages ? `${baseHref}?page=${page + 1}` : null;
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
