import { isDemoMode } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import { canViewAdminPanel } from "@/lib/auth/permissions";
import { AppShell } from "@/components/layout/app-shell";
import { panelNav } from "@/components/layout/nav-config";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/panel");
  const nav = panelNav();
  if (canViewAdminPanel(user.role)) {
    nav.push({ href: "/admin", label: "Administración", icon: "shield" });
  }

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
      variant="panel"
    >
      {children}
    </AppShell>
  );
}
