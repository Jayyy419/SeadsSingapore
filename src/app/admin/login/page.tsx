export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="font-display mb-6 text-2xl">Admin login</h1>
      <form method="POST" action="/admin/api/login" className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          className="rounded-xl border border-[color:var(--foreground-soft)] px-4 py-3 text-sm"
        />
        {error && <p className="text-xs font-semibold text-[#e2965f]">Incorrect password.</p>}
        <button
          type="submit"
          className="rounded-full bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--brand-deep)]"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
