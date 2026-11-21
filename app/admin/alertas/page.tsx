import type { Metadata } from "next";
import {
  AlertTriangle,
  CheckCircle2,
  Pencil,
  PlusCircle,
  Power,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listWeatherAlerts } from "@/services/weather-alerts";
import {
  deleteAlertAction,
  toggleAlertAction,
} from "@/features/admin/actions";
import { DeleteButton } from "@/features/admin/components/delete-button";
import { NotifyButton } from "@/features/admin/components/notify-button";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/empty-state";
import { SEVERITY_LABELS, SEVERITY_TONE } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Alertas" };

interface PageProps {
  searchParams: Promise<{ ok?: string }>;
}

export default async function AdminAlertsPage({ searchParams }: PageProps) {
  await requireAdmin("/admin/alertas");
  const params = await searchParams;
  const alerts = await listWeatherAlerts({ includeInactive: true, limit: 200 });

  return (
    <div>
      <PageHeader
        eyebrow="Módulo meteorológico"
        title="Alertas"
        description="Registra solo alertas verificadas con fuente y vigencia. No se generan alertas automáticas a partir de pronósticos."
        actions={
          <ButtonLink href="/admin/alertas/nueva" size="sm">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Nueva alerta
          </ButtonLink>
        }
      />

      {params.ok && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-pacha-700/20 bg-pacha-50 px-4 py-3 text-sm text-pacha-900">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Alerta {params.ok === "creado" ? "creada" : "actualizada"} correctamente.
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-2xl border border-pacha-900/10 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {alert.isDemo && <DemoBadge />}
                    <Badge tone={SEVERITY_TONE[alert.severity]}>
                      {SEVERITY_LABELS[alert.severity]}
                    </Badge>
                    <Badge tone={alert.isActive ? "green" : "neutral"}>
                      {alert.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-semibold">
                    {alert.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/60">
                    {alert.description}
                  </p>
                  <p className="mt-2 text-[11px] text-ink/45">
                    Fuente: {alert.source} ·{" "}
                    {alert.municipalityName ?? alert.departmentName ?? "Toda Bolivia"}{" "}
                    · {formatDateTime(alert.startsAt)} –{" "}
                    {alert.endsAt ? formatDateTime(alert.endsAt) : "sin fin"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <NotifyButton kind="weather_alert" id={alert.id} />
                  <form action={toggleAlertAction.bind(null, alert.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-pacha-800 hover:bg-pacha-50"
                    >
                      <Power className="h-3.5 w-3.5" aria-hidden />
                      {alert.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <ButtonLink
                    href={`/admin/alertas/${alert.id}`}
                    variant="ghost"
                    size="sm"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Editar
                  </ButtonLink>
                  <DeleteButton
                    action={deleteAlertAction.bind(null, alert.id)}
                    confirmMessage="¿Eliminar esta alerta?"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<AlertTriangle className="h-5 w-5" />}
          title="No hay alertas registradas"
          description="Crea una alerta solo cuando exista información verificada y una fuente identificable."
          action={
            <ButtonLink href="/admin/alertas/nueva" size="sm">
              <PlusCircle className="h-4 w-4" aria-hidden />
              Nueva alerta
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
