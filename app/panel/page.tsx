import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CloudSun,
  MapPin,
  Sprout,
  UserRound,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listAnnouncementsForUser } from "@/services/announcements";
import { listMeetings } from "@/services/meetings";
import { listWeatherAlerts } from "@/services/weather-alerts";
import { listEducationalContents } from "@/services/education";
import { MeetingCard } from "@/components/meetings/meeting-card";
import { WeatherAlertCard } from "@/components/weather/weather-alert-card";
import { ContentCard } from "@/components/education/content-card";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi panel" };

export default async function PanelHomePage() {
  const user = await requireUser("/panel");

  const [announcements, meetings, allAlerts, contents] = await Promise.all([
    listAnnouncementsForUser(user, { limit: 4 }),
    listMeetings({ departmentId: user.departmentId ?? undefined, limit: 3 }),
    listWeatherAlerts({ departmentId: user.departmentId ?? undefined, limit: 10 }),
    listEducationalContents({
      cropId: user.cropIds[0],
      limit: 3,
    }),
  ]);

  const alerts = user.departmentId
    ? allAlerts.filter(
        (alert) =>
          alert.departmentId === null || alert.departmentId === user.departmentId,
      )
    : allAlerts.filter((alert) => alert.departmentId === null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-pacha-700">
            {greeting}
          </p>
          <h1 className="mt-1 text-balance text-2xl font-semibold sm:text-3xl">
            {user.fullName.split(" ")[0]}, este es tu campo hoy.
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/55">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {[user.communityName, user.municipalityName, user.departmentName]
                .filter(Boolean)
                .join(", ") || "Ubicación pendiente"}
            </span>
            {user.cropIds.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Sprout className="h-3.5 w-3.5" aria-hidden />
                {user.cropIds.length} cultivos de interés
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/panel/clima" variant="secondary" size="sm">
            <CloudSun className="h-4 w-4" aria-hidden />
            Ver clima
          </ButtonLink>
          <ButtonLink href="/panel/perfil" variant="outline" size="sm">
            <UserRound className="h-4 w-4" aria-hidden />
            Editar perfil
          </ButtonLink>
        </div>
      </div>

      {(!user.departmentId || user.cropIds.length === 0) && (
        <div className="mt-5 rounded-2xl border border-gold-500/30 bg-gold-50 px-5 py-4 text-sm text-gold-900">
          <p className="font-bold">Completa tu perfil para recibir mejor información</p>
          <p className="mt-0.5 text-xs">
            Agrega tu municipio y cultivos de interés.{" "}
            <Link href="/panel/perfil" className="font-bold underline underline-offset-2">
              Completar ahora
            </Link>
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              icon={<BellRing className="h-4.5 w-4.5" />}
              title="Alertas para tu zona"
              description="Vigencia y fuente visibles. Los datos DEMO no son avisos oficiales."
              action={
                <Link
                  href="/panel/clima"
                  className="inline-flex items-center gap-1 text-xs font-bold text-pacha-800"
                >
                  Ver clima <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
            <CardBody>
              {alerts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {alerts.slice(0, 2).map((alert) => (
                    <WeatherAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CloudSun className="h-5 w-5" />}
                  title="Sin alertas activas para tu zona"
                  description="No mostramos pronósticos inventados. Consulta el módulo de clima para ver la información disponible."
                  action={
                    <ButtonLink href="/panel/clima" size="sm" variant="secondary">
                      Consultar clima
                    </ButtonLink>
                  }
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<CalendarDays className="h-4.5 w-4.5" />}
              title="Próximas reuniones"
              description="Asambleas, talleres y encuentros comunitarios."
              action={
                <Link
                  href="/panel/reuniones"
                  className="inline-flex items-center gap-1 text-xs font-bold text-pacha-800"
                >
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
            <CardBody>
              {meetings.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {meetings.slice(0, 2).map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      href={`/panel/reuniones/${meeting.id}`}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarDays className="h-5 w-5" />}
                  title="No hay reuniones próximas"
                  description="Cuando se programe una reunión para tu zona, aparecerá aquí."
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<BookOpen className="h-4.5 w-4.5" />}
              title="Para aprender esta semana"
              description={
                user.cropIds.length > 0
                  ? "Contenido relacionado con tus cultivos."
                  : "Contenido educativo reciente."
              }
              action={
                <Link
                  href="/panel/biblioteca"
                  className="inline-flex items-center gap-1 text-xs font-bold text-pacha-800"
                >
                  Biblioteca <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2">
                {contents.slice(0, 2).map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    href={`/panel/biblioteca/${content.slug}`}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl bg-pacha-900 p-5 text-white shadow-card">
            <div className="absolute inset-0 topo-pattern opacity-60" aria-hidden />
            <div className="relative">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300">
                <CloudSun className="h-3.5 w-3.5" aria-hidden />
                Clima y alertas
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {user.municipalityName ?? "Tu municipio"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-pacha-100/65">
                Consulta temperatura, lluvia y pronóstico con la fuente y hora
                de actualización.
              </p>
              <ButtonLink
                href={`/panel/clima${user.municipalityId ? `?municipio=${user.municipalityId}` : ""}`}
                variant="gold"
                size="sm"
                className="mt-4"
              >
                Consultar ahora
                <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
              <p className="mt-3 text-[10px] text-pacha-100/40">
                Si la fuente no responde, verás un aviso sin datos estimados.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader
              icon={<BellRing className="h-4.5 w-4.5" />}
              title="Anuncios recientes"
              action={
                <Link
                  href="/panel/anuncios"
                  className="text-xs font-bold text-pacha-800"
                >
                  Ver todos
                </Link>
              }
            />
            <CardBody className="space-y-3">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <Link
                    key={announcement.id}
                    href={`/panel/anuncios/${announcement.id}`}
                    className="block rounded-xl border border-pacha-900/8 p-3 transition hover:border-pacha-700/25 hover:bg-pacha-50/50"
                  >
                    <div className="flex items-center gap-2">
                      {announcement.isDemo && <Badge tone="gold">DEMO</Badge>}
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">
                        {formatDate(announcement.publishedAt ?? announcement.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-bold leading-snug text-pacha-950">
                      {announcement.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/55">
                      {announcement.summary}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-ink/50">
                  No hay anuncios para tu perfil.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
