"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

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
        setStatus("error");
        return;
      }

      // Full navigation (not client-side routing) so proxy.ts re-evaluates with the fresh
      // cookie the browser just received.
      window.location.href = "/admin";
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="font-display mb-6 text-2xl">Admin login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          className="rounded-xl border border-[color:var(--foreground-soft)] px-4 py-3 text-sm"
        />
        {status === "error" && <p className="text-xs font-semibold text-[#e2965f]">Incorrect password.</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)] disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
