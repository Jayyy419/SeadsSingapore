"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

export default function AdminLoginPage() {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(t.adminLoginIncorrectPassword);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");

    setStatus("loading");
    try {
      const res = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        // The Lambda's error text (e.g. the rate-limit message) is only ever in English —
        // it comes from the API, not this page's i18n dictionary — so only the generic
        // fallback below is localized.
        const body = await res.json().catch(() => null);
        setErrorMessage(body?.error ? `${body.error}${body.error.endsWith(".") ? "" : "."}` : t.adminLoginIncorrectPassword);
        setStatus("error");
        return;
      }

      // Full navigation (not client-side routing) so proxy.ts re-evaluates with the fresh
      // cookie the browser just received.
      window.location.href = "/admin";
    } catch {
      setErrorMessage(t.adminLoginIncorrectPassword);
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--surface-2)] px-4">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center font-display text-2xl font-bold text-[color:var(--foreground)]">
          Seads <span className="text-[color:var(--brand)]">Admin</span>
        </p>
        <div className="section-card p-6 sm:p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              name="password"
              placeholder={t.adminLoginPasswordPlaceholder}
              required
              autoFocus
              className="rounded-xl border border-[color:var(--foreground-soft)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--foreground)]"
            />
            {status === "error" && <p className="text-xs font-semibold text-[#e2965f]">{errorMessage}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)] disabled:opacity-60"
            >
              {status === "loading" ? "..." : t.adminLoginButton}
            </button>
          </form>
        </div>
        <Link
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]"
        >
          &larr; {t.adminLoginBackToSite}
        </Link>
      </div>
    </div>
  );
}
