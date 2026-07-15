"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminLoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("Incorrect password.");

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
        const body = await res.json().catch(() => null);
        setErrorMessage(body?.error ? `${body.error}${body.error.endsWith(".") ? "" : "."}` : "Incorrect password.");
        setStatus("error");
        return;
      }

      // Full navigation (not client-side routing) so proxy.ts re-evaluates with the fresh
      // cookie the browser just received.
      window.location.href = "/admin";
    } catch {
      setErrorMessage("Incorrect password.");
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
              placeholder="Password"
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
              {status === "loading" ? "..." : "Log in"}
            </button>
          </form>
        </div>
        <Link
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]"
        >
          &larr; Back to seads.sg
        </Link>
      </div>
    </div>
  );
}
