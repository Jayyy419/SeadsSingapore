"use client";

import Link from "next/link";

// Without this boundary, a failed Server Action under /admin (most commonly: the 8-hour
// session expiring mid-edit, so the Lambda returns 401 and the action throws) dumped the
// admin on Next's bare default error screen with no explanation. It can't preserve the form
// they were typing into — that's gone with the failed action — but it can at least say what
// probably happened and route them straight back through login.
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[color:var(--surface-2)] px-4 text-center">
      <h1 className="font-display text-2xl text-[color:var(--foreground)]">Something went wrong</h1>
      <p className="max-w-md text-sm text-[color:var(--muted)]">
        This usually means your admin session expired (sessions last 8 hours). Log in again and retry — if you were mid-edit,
        the change didn&apos;t save.
      </p>
      <div className="flex gap-3">
        <Link
          href="/admin/login"
          className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
        >
          Log in again
        </Link>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-[color:var(--foreground-soft)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
