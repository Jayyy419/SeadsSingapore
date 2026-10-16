"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://jztkgrm3lh.execute-api.ap-southeast-1.amazonaws.com";

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
      // Straight from the browser to the Lambda, not via this app's server: the Lambda rate-limits
      // login attempts by source IP, and proxied through Amplify every visitor arrived from the
      // same server IP — one shared bucket of 10 attempts, so anyone could lock the admin out by
      // mistyping ten times. Called directly, the source IP is the visitor's own, and it can't be
      // spoofed the way a forwarded-IP header could.
      const res = await fetch(`${API_BASE_URL}/admin-login`, {
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

      // The session cookie is httpOnly, so script can't set it — this app's server does, from the
      // token the Lambda just issued.
      const { token } = await res.json();
      const session = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!session.ok) {
        setErrorMessage(t.statusError);
        setStatus("error");
        return;
      }

      // Full navigation (not client-side routing) so proxy.ts re-evaluates with the fresh
      // cookie the browser just received.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- see above
      window.location.href = "/admin";
    } catch {
      // A network or CORS failure, not a wrong password — say so rather than send the admin
      // off retyping a password that was right.
      setErrorMessage(t.statusError);
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
              aria-label={t.adminLoginPasswordPlaceholder}
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
