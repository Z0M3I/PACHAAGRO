import { isDemoMode } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DemoBanner } from "@/components/layout/demo-banner";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {isDemoMode && <DemoBanner />}
      <SiteHeader hasSession={Boolean(user)} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
