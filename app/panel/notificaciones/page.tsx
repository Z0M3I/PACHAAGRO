import type { Metadata } from "next";
import Link from "next/link";
import {
  BellRing,
  FlaskConical,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  isWhatsAppConfigured,
  isWhatsAppSimulation,
} from "@/lib/env";
import { getPreferences } from "@/services/profiles";
import { listUserNotificationLogs } from "@/services/whatsapp/messages";
import { PreferencesForm } from "@/features/notifications/components/preferences-form";
import { StatusBadge } from "@/components/notifications/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Notificaciones" };

const typeLabels: Record<string, string> = {
  weather_alert: "Alerta climática",
  meeting: "Reunión",
  announcement: "Anuncio",
  educational: "Contenido educativo",
  system: "Sistema",
};

export default async function NotificationsPage() {
  const user = await requireUser("/panel/notificaciones");
  const [preferences, logs] = await Promise.all([
    getPreferences(user.id),
    listUserNotificationLogs(user.id, 25),
  ]);

  const integrationLabel = isWhatsAppConfigured
    ? "WhatsApp Cloud API configurado"
    : isWhatsAppSimulation
      ? "Modo simulación (sin credenciales de Meta)"
      : "Integración deshabilitada";

  return (
    <div>
      <PageHeader
        eyebrow="Consentimiento y privacidad"
        title="Notificaciones"
        description="Elige qué información quieres recibir y por qué canal. El consentimiento de WhatsApp es explícito y puedes retirarlo cuando quieras."
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            icon={<BellRing className="h-4.5 w-4.5" />}
            title="Preferencias de notificación"
            description="Aplican a los avisos enviados por PACHAAGRO."
          />
          <CardBody>
            <PreferencesForm
              preferences={preferences}
              hasPhone={Boolean(user.phone)}
            />
            {!user.phone && (
              <Alert tone="warning" className="mt-4">
                Agrega un teléfono en{" "}
                <Link
                  href="/panel/perfil"
                  className="font-bold underline underline-offset-2"
                >
                  tu perfil
                </Link>{" "}
                para activar WhatsApp.
              </Alert>
            )}
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              icon={<MessageCircle className="h-4.5 w-4.5" />}
              title="Canal de WhatsApp"
              description={integrationLabel}
            />
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink/55">Estado del consentimiento</span>
                <Badge tone={preferences.whatsappOptIn ? "green" : "neutral"}>
                  {preferences.whatsappOptIn ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink/55">Teléfono registrado</span>
                <span className="font-semibold">{user.phone ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink/55">Fecha de consentimiento</span>
                <span>
                  {preferences.consentAt
                    ? formatDateTime(preferences.consentAt)
                    : "—"}
                </span>
              </div>
              <div className="rounded-xl bg-pacha-50 p-3 text-xs leading-relaxed text-ink/60">
                <p className="flex items-center gap-1.5 font-bold text-pacha-950">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Cómo darte de baja
                </p>
                <p className="mt-1">
                  Responde <strong>BAJA</strong> al número oficial de PACHAAGRO o
                  desactiva la opción en este formulario. Los mensajes
                  iniciados por la plataforma usan plantillas aprobadas por
                  Meta.
                </p>
              </div>
              {(isWhatsAppSimulation || !isWhatsAppConfigured) && (
                <Alert tone="warning">
                  <span className="flex items-start gap-1.5">
                    <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    No se enviarán mensajes reales: faltan credenciales de Meta.
                    Los registros aparecen como SIMULADOS.
                  </span>
                </Alert>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<UserRound className="h-4.5 w-4.5" />}
              title="Datos de contacto"
              description="El teléfono se usa para identificar tu cuenta en el bot."
            />
            <CardBody>
              <p className="text-sm text-ink/60">
                {user.fullName}
                <br />
                {user.phone ?? "Sin teléfono"}
                <br />
                {user.municipalityName ?? "Sin municipio"}
              </p>
              <Link
                href="/panel/perfil"
                className="mt-3 inline-flex text-xs font-bold text-pacha-800 underline underline-offset-2"
              >
                Editar mis datos
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader
          icon={<BellRing className="h-4.5 w-4.5" />}
          title="Historial de notificaciones"
          description="Solo se muestran tus envíos. Los estados dependen del proveedor cuando está configurado."
        />
        <CardBody>
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-pacha-900/10 text-[10px] uppercase tracking-wide text-ink/40">
                  <tr>
                    <th className="pb-2 pr-3 font-bold">Fecha</th>
                    <th className="pb-2 pr-3 font-bold">Tipo</th>
                    <th className="pb-2 pr-3 font-bold">Canal</th>
                    <th className="pb-2 pr-3 font-bold">Estado</th>
                    <th className="pb-2 font-bold">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pacha-900/8">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap py-3 pr-3 text-xs text-ink/55">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-3 pr-3 text-xs">
                        {typeLabels[log.notificationType] ?? log.notificationType}
                      </td>
                      <td className="py-3 pr-3 text-xs capitalize">
                        {log.channel}
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="py-3 text-xs text-ink/45">
                        {log.isSimulated
                          ? "Envío simulado (sin credenciales)"
                          : log.errorMessage ?? "Procesado por la plataforma"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<BellRing className="h-5 w-5" />}
              title="Todavía no tienes notificaciones"
              description="Cuando se envíe un aviso a tu perfil, aparecerá en este historial con su estado."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
