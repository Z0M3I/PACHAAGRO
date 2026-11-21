import { isDemoMode } from "@/lib/env";
import { requireAdminPanel } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { adminNav } from "@/components/layout/nav-config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminPanel("/admin");
  const nav = adminNav(user.role);
  nav.push({ href: "/panel", label: "Panel del productor", icon: "user" });

  return (
    <AppShell
      user={{
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }}
      nav={nav}
      isDemo={isDemoMode}
      variant="admin"
    >
      {children}
    </AppShell>
  );
}
