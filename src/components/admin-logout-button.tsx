"use client";

// fetch()-based, same reasoning as the login form in src/app/admin/login/page.tsx — avoids
// relying on the CSP's form-action directive for a native <form> POST.
export function AdminLogoutButton() {
  async function onLogout() {
    await fetch("/admin/api/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button onClick={onLogout} className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]">
      Log out
    </button>
  );
}
