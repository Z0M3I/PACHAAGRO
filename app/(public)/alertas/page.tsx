import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, BellRing, Info, Megaphone } from "lucide-react";
import { listAnnouncements } from "@/services/announcements";
import { listWeatherAlerts } from "@/services/weather-alerts";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { WeatherAlertCard } from "@/components/weather/weather-alert-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Alertas y comunicados",
  description:
    "Alertas meteorológicas, comunicados agrícolas y avisos comunitarios con ubicación, vigencia y fuente.",
};

export default async function AlertsPage() {
  const [alerts, announcements] = await Promise.all([
    listWeatherAlerts({ limit: 20 }),
    listAnnouncements({ limit: 20 }),
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver al inicio
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="eyebrow">
          <BellRing className="h-3.5 w-3.5" aria-hidden />
          Centro de comunicación
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
          Alertas y comunicados del campo.
        </h1>
        <p className="mt-3 text-pretty text-base leading-relaxed text-ink/60">
          Información organizada por ubicación, tipo y vigencia. Cada registro
          indica su procedencia. Los datos marcados como DEMO no son avisos
          oficiales.
        </p>
      </div>

      <div className="mt-7 flex flex-wrap items-start gap-3 rounded-2xl border border-gold-500/30 bg-gold-50 px-5 py-4 text-sm text-gold-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>
          <strong>Importante:</strong> PACHAAGRO no emite alertas oficiales. Ante
          una emergencia, siga las indicaciones de las autoridades y de los
          servicios meteorológicos competentes.
        </p>
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <AlertTriangle className="h-5 w-5 text-gold-600" aria-hidden />
            Alertas activas
          </h2>
          <span className="text-xs font-semibold text-ink/45">
            {alerts.length} {alerts.length === 1 ? "registro" : "registros"}
          </span>
        </div>
        {alerts.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
              <WeatherAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-5"
            icon={<Info className="h-5 w-5" />}
            title="No hay alertas activas"
            description="No se muestran datos estimados. Cuando exista información disponible con fuente identificada, aparecerá en esta sección."
          />
        )}
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Megaphone className="h-5 w-5 text-pacha-700" aria-hidden />
            Comunicados y anuncios
          </h2>
          <span className="text-xs font-semibold text-ink/45">
            {announcements.length}{" "}
            {announcements.length === 1 ? "publicación" : "publicaciones"}
          </span>
        </div>
        {announcements.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                href={`/alertas/${announcement.slug}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-5"
            icon={<Megaphone className="h-5 w-5" />}
            title="Todavía no hay comunicados"
            description="Los anuncios publicados por el equipo y las asociaciones aparecerán aquí."
          />
        )}
      </section>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-pacha-900 px-6 py-7 text-white sm:px-8">
        <div>
          <p className="font-display text-xl font-semibold">
            ¿Quieres recibir estos avisos por WhatsApp?
          </p>
          <p className="mt-1 text-sm text-pacha-100/65">
            Activa las notificaciones con consentimiento explícito y cancela
            cuando quieras.
          </p>
        </div>
        <ButtonLink href="/registro" variant="gold">
          Crear mi cuenta
        </ButtonLink>
      </div>
    </div>
  );
}
