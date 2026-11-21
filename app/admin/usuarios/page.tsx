import type { Metadata } from "next";
import {
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listProfilesWithPreferences } from "@/services/profiles";
import {
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { RoleForm } from "@/features/admin/components/role-form";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";
import { ROLE_LABELS } from "@/types/actions";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Usuarios" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin("/admin/usuarios");
  const [pairs, departments, municipalities] = await Promise.all([
    listProfilesWithPreferences(),
    getDepartments(),
    getMunicipalities(),
  ]);

  const roleCounts = {
    producer: pairs.filter(({ profile }) => profile.role === "producer").length,
    association_manager: pairs.filter(
      ({ profile }) => profile.role === "association_manager",
    ).length,
    content_editor: pairs.filter(
      ({ profile }) => profile.role === "content_editor",
    ).length,
    admin: pairs.filter(({ profile }) => profile.role === "admin").length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios y roles"
        description="Asigna roles con cuidado. Los permisos administrativos se validan en el servidor y en las políticas RLS."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(roleCounts).map(([role, count]) => (
          <Card key={role}>
            <CardBody className="flex items-center gap-3 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-pacha-100 text-pacha-800">
                <Users className="h-4.5 w-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/40">
                  {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                </p>
                <p className="font-display text-xl font-semibold">{count}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-pacha-900/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-pacha-50/80 text-[10px] uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-4 py-3 font-bold">Usuario</th>
                <th className="px-4 py-3 font-bold">Ubicación</th>
                <th className="px-4 py-3 font-bold">WhatsApp</th>
                <th className="px-4 py-3 font-bold">Registro</th>
                <th className="px-4 py-3 font-bold">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pacha-900/8">
              {pairs.map(({ profile, preference }) => {
                const department = departments.find(
                  (item) => item.id === profile.departmentId,
                );
                const municipality = municipalities.find(
                  (item) => item.id === profile.municipalityId,
                );
                return (
                  <tr key={profile.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pacha-100 text-[10px] font-bold text-pacha-900">
                          {initials(profile.fullName)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="font-bold text-pacha-950">
                              {profile.fullName}
                            </p>
                            {profile.isDemo && <DemoBadge />}
                            {profile.id === admin.id && (
                              <Badge tone="blue">Tú</Badge>
                            )}
                          </div>
                          <p className="break-all text-[11px] text-ink/45">
                            {profile.email ?? "Sin correo"}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink/40">
                            <Phone className="h-3 w-3" aria-hidden />
                            {profile.phone ?? "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink/60">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-pacha-600" aria-hidden />
                        {[municipality?.name, department?.name]
                          .filter(Boolean)
                          .join(", ") || "Sin ubicación"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge
                          tone={preference.whatsappOptIn ? "green" : "neutral"}
                        >
                          <MessageCircle className="h-3 w-3" aria-hidden />
                          {preference.whatsappOptIn ? "Con consentimiento" : "Sin consentimiento"}
                        </Badge>
                        <span className="text-[10px] text-ink/40">
                          {preference.weatherAlerts ? "Clima · " : ""}
                          {preference.meetingNotices ? "Reuniones · " : ""}
                          {preference.announcements ? "Anuncios" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ink/50">
                      {formatDate(profile.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <RoleForm
                        profileId={profile.id}
                        currentRole={profile.role}
                        disabled={profile.id === admin.id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-pacha-900/10 bg-pacha-50 px-4 py-3 text-xs leading-relaxed text-ink/55">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-pacha-700" aria-hidden />
        <p>
          No puedes cambiar tu propio rol desde este panel, para evitar perder el
          acceso administrativo. Los roles se protegen además con un trigger en
          la base de datos y políticas RLS. La creación o eliminación de cuentas
          de autenticación se realiza desde Supabase Auth.
        </p>
      </div>
    </div>
  );
}
