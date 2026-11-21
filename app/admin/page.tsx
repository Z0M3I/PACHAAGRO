import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  MapPin,
  PlusCircle,
  Send,
  Users,
} from "lucide-react";
import { requireAdminPanel } from "@/lib/auth/session";
import {
  isOfficialWeatherConfigured,
  isWhatsAppConfigured,
  isWhatsAppSimulation,
} from "@/lib/env";
import { getAdminStats } from "@/services/admin";
import { listAnnouncements } from "@/services/announcements";
import { listEducationalContents } from "@/services/education";
import { listMeetings } from "@/services/meetings";
import { listWeatherAlerts } from "@/services/weather-alerts";
import { listNotificationLogs } from "@/services/admin";
import { getRecentRegistrations } from "@/services/admin";
import { getDepartments } from "@/services/reference";
import { StatusBadge } from "@/components/notifications/status-badge";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/lib/labels";
import { formatDate, formatDateTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Panel administrativo" };

export default async function AdminDashboardPage() {
  const user = await requireAdminPanel("/admin");
  const isAdmin = user.role === "admin";

  const [stats, announcements, contents, meetings, alerts, logs, registrations, departments] =
    await Promise.all([
      isAdmin ? getAdminStats() : Promise.resolve(null),
      listAnnouncements({ includeUnpublished: true, limit: 5 }),
      listEducationalContents({ includeUnpublished: true, limit: 5 }),
      listMeetings({ includePast: false, limit: 5 }),
      isAdmin
        ? listWeatherAlerts({ includeInactive: true, limit: 5 })
        : Promise.resolve([]),
      isAdmin ? listNotificationLogs({ limit: 6 }) : Promise.resolve([]),
      isAdmin ? getRecentRegistrations(5) : Promise.resolve([]),
      getDepartments(),
    ]);

  const draftCount =
    announcements.filter((item) => !item.isPublished).length +
    contents.filter((item) => !item.isPublished).length;

  return (
    <div>
      <PageHeader
        eyebrow={isAdmin ? "Centro de gestión" : "Editor de contenido"}
        title={`Hola, ${user.fullName.split(" ")[0]}`}
        description={
          isAdmin
            ? "Resumen operativo de la plataforma: usuarios, comunicación, alertas y notificaciones."
            : "Gestiona publicaciones y contenidos educativos. Las acciones sensibles están reservadas al administrador."
        }
        actions={
          <>
            <ButtonLink href="/admin/publicaciones/nueva" size="sm">
              <PlusCircle className="h-4 w-4" aria-hidden />
              Nueva publicación
            </ButtonLink>
            <ButtonLink
              href="/admin/biblioteca/nuevo"
              variant="outline"
              size="sm"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Nuevo contenido
            </ButtonLink>
          </>
        }
      />

      {isAdmin && stats ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Usuarios totales"
            value={stats.totalUsers}
            icon={<Users className="h-5 w-5" />}
            hint={`${stats.producers} productores registrados`}
          />
          <StatCard
            label="Departamentos"
            value={stats.departmentsRepresented}
            icon={<MapPin className="h-5 w-5" />}
            hint="Con al menos un usuario"
            tone="blue"
          />
          <StatCard
            label="Publicaciones"
            value={stats.announcements}
            icon={<FileText className="h-5 w-5" />}
            hint="Anuncios, eventos y comunicados"
            tone="gold"
          />
          <StatCard
            label="Alertas activas"
            value={stats.activeAlerts}
            icon={<AlertTriangle className="h-5 w-5" />}
            hint="Visibles en la plataforma"
            tone="clay"
          />
          <StatCard
            label="Reuniones próximas"
            value={stats.upcomingMeetings}
            icon={<CalendarDays className="h-5 w-5" />}
          />
          <StatCard
            label="Contenidos"
            value={stats.educationalContents}
            icon={<BookOpen className="h-5 w-5" />}
            tone="blue"
          />
          <StatCard
            label="Notificaciones"
            value={stats.notificationsSent}
            icon={<Send className="h-5 w-5" />}
            hint="Registros de envío"
            tone="gold"
          />
          <StatCard
            label="Borradores"
            value={draftCount}
            icon={<FileText className="h-5 w-5" />}
            hint="Pendientes de publicar"
            tone="clay"
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Publicaciones"
            value={announcements.length}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            label="Contenidos"
            value={contents.length}
            icon={<BookOpen className="h-5 w-5" />}
            tone="blue"
          />
          <StatCard
            label="Borradores"
            value={draftCount}
            icon={<FileText className="h-5 w-5" />}
            tone="gold"
          />
          <StatCard
            label="Próximas reuniones"
            value={meetings.length}
            icon={<CalendarDays className="h-5 w-5" />}
            tone="clay"
          />
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<FileText className="h-4.5 w-4.5" />}
            title="Publicaciones recientes"
            description="Últimos comunicados creados, incluidos borradores."
            action={
              <Link
                href="/admin/publicaciones"
                className="inline-flex items-center gap-1 text-xs font-bold text-pacha-800"
              >
                Gestionar <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardBody className="space-y-2">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/admin/publicaciones/${announcement.id}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-pacha-900/8 p-3 transition hover:border-pacha-700/25 hover:bg-pacha-50/40"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">
                        {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
                      </Badge>
                      {announcement.isDemo && <DemoBadge />}
                      {!announcement.isPublished && (
                        <Badge tone="gold">Borrador</Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-pacha-950">
                      {announcement.title}
                    </p>
                    <p className="text-[11px] text-ink/45">
                      {formatDate(announcement.updatedAt)}
                    </p>
                  </div>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-ink/25" />
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-ink/45">
                No hay publicaciones.
              </p>
            )}
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              icon={<CalendarDays className="h-4.5 w-4.5" />}
              title="Próximas reuniones"
            />
            <CardBody className="space-y-2">
              {meetings.length > 0 ? (
                meetings.slice(0, 3).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="rounded-xl border border-pacha-900/8 p-3"
                  >
                    <p className="text-xs font-bold leading-snug">
                      {meeting.title}
                    </p>
                    <p className="mt-1 text-[10px] text-ink/45">
                      {formatDateTime(meeting.startsAt)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-ink/40">
                      <MapPin className="h-3 w-3" aria-hidden />
                      {meeting.location}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-center text-xs text-ink/45">
                  Sin reuniones próximas.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<CheckCircle2 className="h-4.5 w-4.5" />}
              title="Estado de integraciones"
            />
            <CardBody className="space-y-2 text-xs">
              <p className="flex items-center justify-between gap-2">
                <span className="text-ink/55">WhatsApp</span>
                <Badge tone={isWhatsAppConfigured ? "green" : "gold"}>
                  {isWhatsAppConfigured
                    ? "Cloud API configurada"
                    : isWhatsAppSimulation
                      ? "Simulación"
                      : "Deshabilitado"}
                </Badge>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="text-ink/55">Clima</span>
                <Badge tone={isOfficialWeatherConfigured ? "green" : "gold"}>
                  {isOfficialWeatherConfigured
                    ? "Fuente oficial + respaldo"
                    : "Open-Meteo (no oficial)"}
                </Badge>
              </p>
              <p className="flex items-center justify-between gap-2">
                <span className="text-ink/55">Mapas</span>
                <Badge tone="green">OpenStreetMap</Badge>
              </p>
              <Link
                href="/api/health"
                className="mt-2 inline-flex text-[11px] font-bold text-pacha-800 underline underline-offset-2"
              >
                Ver estado técnico
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader
              icon={<BellRing className="h-4.5 w-4.5" />}
              title="Historial de notificaciones"
              action={
                <Link
                  href="/admin/notificaciones"
                  className="text-xs font-bold text-pacha-800"
                >
                  Ver todo
                </Link>
              }
            />
            <CardBody>
              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-pacha-900/8 px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {log.recipientName ?? log.recipientPhone}
                        </p>
                        <p className="text-[10px] text-ink/40">
                          {log.notificationType} · {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={log.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-ink/45">
                  Sin envíos registrados.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<Users className="h-4.5 w-4.5" />}
              title="Registros recientes"
              action={
                <Link
                  href="/admin/usuarios"
                  className="text-xs font-bold text-pacha-800"
                >
                  Gestionar
                </Link>
              }
            />
            <CardBody className="space-y-2">
              {registrations.length > 0 ? (
                registrations.map((profile) => {
                  const department = departments.find(
                    (item) => item.id === profile.departmentId,
                  );
                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-2.5 rounded-lg border border-pacha-900/8 px-3 py-2"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-pacha-100 text-[10px] font-bold text-pacha-900">
                        {initials(profile.fullName)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">
                          {profile.fullName}
                        </p>
                        <p className="text-[10px] text-ink/40">
                          {department?.name ?? "Sin departamento"} ·{" "}
                          {formatDate(profile.createdAt)}
                        </p>
                      </div>
                      {profile.isDemo && <DemoBadge />}
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-center text-sm text-ink/45">
                  Sin registros.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {isAdmin && alerts.length > 0 && (
        <Card className="mt-5">
          <CardHeader
            icon={<AlertTriangle className="h-4.5 w-4.5" />}
            title="Alertas registradas"
            action={
              <Link href="/admin/alertas" className="text-xs font-bold text-pacha-800">
                Gestionar
              </Link>
            }
          />
          <CardBody className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-pacha-900/8 p-3 text-xs"
              >
                <div className="flex items-center gap-1.5">
                  {alert.isDemo && <DemoBadge />}
                  <Badge tone={alert.isActive ? "green" : "neutral"}>
                    {alert.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <p className="mt-1.5 font-bold leading-snug">{alert.title}</p>
                <p className="mt-0.5 text-[10px] text-ink/40">{alert.source}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
