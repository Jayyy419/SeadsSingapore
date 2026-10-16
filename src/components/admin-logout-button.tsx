"use client";

// fetch()-based, same reasoning as the login form in src/app/admin/login/page.tsx — avoids
// relying on the CSP's form-action directive for a native <form> POST.
export function AdminLogoutButton() {
  async function onLogout() {
    await fetch("/admin/api/logout", { method: "POST" });
    // Full navigation, not router.push: it drops the client router cache, which still holds
    // the admin pages rendered while signed in.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- see above
    window.location.href = "/admin/login";
  }

  return (
    <button onClick={onLogout} className="text-sm font-semibold text-[color:var(--muted)] hover:text-[color:var(--brand)]">
      Log out
    </button>
  );
}
