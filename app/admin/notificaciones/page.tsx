import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  FlaskConical,
  MessageCircle,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import {
  isWhatsAppConfigured,
  isWhatsAppSimulation,
} from "@/lib/env";
import { listNotificationLogs } from "@/services/admin";
import { listWhatsAppMessages } from "@/services/whatsapp/messages";
import { TEMPLATE_CONTRACTS } from "@/services/whatsapp/templates";
import { StatusBadge } from "@/components/notifications/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { formatDateTime, truncate } from "@/lib/utils";

export const metadata: Metadata = { title: "Notificaciones y WhatsApp" };

const kindLabels: Record<string, string> = {
  weather_alert: "Alerta climática",
  meeting: "Reunión",
  announcement: "Anuncio",
  educational: "Contenido",
  system: "Sistema",
};

export default async function AdminNotificationsPage() {
  await requireAdmin("/admin/notificaciones");
  const [logs, messages] = await Promise.all([
    listNotificationLogs({ limit: 100 }),
    listWhatsAppMessages(100),
  ]);

  const simulated = logs.filter((log) => log.isSimulated).length;
  const failed = logs.filter((log) => log.status === "failed").length;
  const sent = logs.filter(
    (log) => log.status === "sent" || log.status === "delivered" || log.status === "read",
  ).length;

  const statusLabel = isWhatsAppConfigured
    ? "Credenciales configuradas"
    : isWhatsAppSimulation
      ? "Simulación activa · sin credenciales de Meta"
      : "Integración deshabilitada";

  return (
    <div>
      <PageHeader
        eyebrow="Trazabilidad"
        title="Notificaciones y WhatsApp"
        description="Historial de envíos, mensajes entrantes y estados reportados por Meta. La escritura se realiza solo en el servidor."
        actions={
          <ButtonLink href="/admin/publicaciones" variant="outline" size="sm">
            Ir a publicaciones
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registros"
          value={logs.length}
          icon={<BellRing className="h-5 w-5" />}
        />
        <StatCard
          label="Enviados"
          value={sent}
          icon={<Send className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label="Simulados"
          value={simulated}
          icon={<FlaskConical className="h-5 w-5" />}
          tone="gold"
        />
        <StatCard
          label="Fallidos"
          value={failed}
          icon={<XCircle className="h-5 w-5" />}
          tone="clay"
        />
      </div>

      <Alert
        tone={isWhatsAppConfigured ? "success" : "warning"}
        className="mt-5"
        title={statusLabel}
      >
        {isWhatsAppConfigured ? (
          <span>
            Los envíos se realizan mediante WhatsApp Cloud API. Los mensajes
            proactivos usan plantillas aprobadas y respetan el consentimiento.
          </span>
        ) : (
          <span>
            No se realizan solicitudes a Meta. Cada intento se registra como
            SIMULADO y la interfaz nunca afirma que un mensaje fue entregado.
            Configura <code>WHATSAPP_ACCESS_TOKEN</code>,{" "}
            <code>WHATSAPP_PHONE_NUMBER_ID</code>,{" "}
            <code>WHATSAPP_VERIFY_TOKEN</code> y{" "}
            <code>WHATSAPP_APP_SECRET</code> para habilitarlo.
          </span>
        )}
      </Alert>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_0.5fr]">
        <Card>
          <CardHeader
            icon={<Send className="h-4.5 w-4.5" />}
            title="Historial de notificaciones"
            description="Registros generados al usar el botón Notificar en cada contenido."
          />
          <CardBody>
            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-pacha-900/10 text-[10px] uppercase tracking-wide text-ink/40">
                    <tr>
                      <th className="pb-2 pr-3 font-bold">Destinatario</th>
                      <th className="pb-2 pr-3 font-bold">Tipo</th>
                      <th className="pb-2 pr-3 font-bold">Estado</th>
                      <th className="pb-2 pr-3 font-bold">Fecha</th>
                      <th className="pb-2 font-bold">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pacha-900/8">
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 pr-3">
                          <p className="text-xs font-bold">
                            {log.recipientName ?? "Sin perfil"}
                          </p>
                          <p className="text-[10px] text-ink/40">
                            {log.recipientPhone}
                          </p>
                        </td>
                        <td className="py-3 pr-3 text-xs">
                          {kindLabels[log.notificationType] ??
                            log.notificationType}
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3 text-[11px] text-ink/45">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="py-3 text-[11px] text-ink/45">
                          {log.isSimulated
                            ? "Simulado · no enviado a Meta"
                            : log.errorMessage ?? "Procesado"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<BellRing className="h-5 w-5" />}
                title="Sin notificaciones registradas"
                description="Usa el botón Notificar en una publicación, alerta, reunión o contenido educativo."
                action={
                  <ButtonLink href="/admin/publicaciones" size="sm">
                    Ver publicaciones
                  </ButtonLink>
                }
              />
            )}
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              icon={<ShieldCheck className="h-4.5 w-4.5" />}
              title="Plantillas"
              description="Deben estar aprobadas en Meta Business Manager."
            />
            <CardBody className="space-y-3">
              {TEMPLATE_CONTRACTS.map((template) => (
                <div key={template.kind} className="text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{template.kind}</Badge>
                    <code className="break-all text-[10px] text-ink/50">
                      {template.name}
                    </code>
                  </div>
                  <p className="mt-1 whitespace-pre-line leading-relaxed text-ink/55">
                    {template.body}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<MessageCircle className="h-4.5 w-4.5" />}
              title="Mensajes recientes"
              description="Entrantes y salientes del webhook."
            />
            <CardBody className="space-y-1.5">
              {messages.slice(0, 8).map((message) => (
                <div
                  key={message.id}
                  className="rounded-lg border border-pacha-900/8 px-3 py-2 text-[11px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={message.direction === "inbound" ? "blue" : "green"}>
                      {message.direction === "inbound" ? "Entrante" : "Saliente"}
                    </Badge>
                    <StatusBadge status={message.status} />
                  </div>
                  <p className="mt-1 text-ink/60">{truncate(message.body, 90)}</p>
                  <p className="mt-0.5 text-[9px] text-ink/35">
                    {formatDateTime(message.createdAt)}
                    {message.isSimulated ? " · SIMULADO" : ""}
                  </p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="py-3 text-center text-xs text-ink/45">
                  Sin mensajes. El webhook debe estar configurado en Meta.
                </p>
              )}
              <Link
                href="/whatsapp"
                className="mt-2 inline-flex text-[11px] font-bold text-pacha-800 underline underline-offset-2"
              >
                Ver documentación pública del bot
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
