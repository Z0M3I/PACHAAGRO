import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  ExternalLink,
  Info,
  RefreshCw,
  ShieldCheck,
  Wind,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getMunicipalities } from "@/services/reference";
import { getDepartments } from "@/services/reference";
import { getWeatherForMunicipality } from "@/services/weather";
import { listWeatherAlerts } from "@/services/weather-alerts";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { WeatherAlertCard } from "@/components/weather/weather-alert-card";
import { WeatherLocationPicker } from "@/features/weather/components/location-picker";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Clima y alertas" };

interface PageProps {
  searchParams: Promise<{ municipio?: string }>;
}

const dayFormatter = new Intl.DateTimeFormat("es-BO", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

function round(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : String(Math.round(value));
}

export default async function WeatherPage({ searchParams }: PageProps) {
  const user = await requireUser("/panel/clima");
  const params = await searchParams;
  const [departments, municipalities] = await Promise.all([
    getDepartments(),
    getMunicipalities(),
  ]);

  const selectedId =
    params.municipio ??
    user.municipalityId ??
    municipalities[0]?.id ??
    "";
  const municipality = municipalities.find((item) => item.id === selectedId);
  const result = selectedId
    ? await getWeatherForMunicipality(selectedId)
    : null;

  const alerts = await listWeatherAlerts({
    departmentId: municipality?.departmentId ?? user.departmentId ?? undefined,
    limit: 10,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Módulo meteorológico"
        title="Clima y alertas"
        description="Consulta condiciones y pronóstico disponible con la fuente y hora de actualización. Si la fuente falla, no mostramos datos estimados."
      />

      <Card>
        <CardHeader
          icon={<CloudRain className="h-4.5 w-4.5" />}
          title="Elige una ubicación"
          description="El pronóstico se consulta para el municipio seleccionado."
        />
        <CardBody>
          <WeatherLocationPicker
            departments={departments}
            municipalities={municipalities}
            selectedMunicipalityId={selectedId || undefined}
          />
          <p className="mt-3 text-xs text-ink/45">
            Tu ubicación guardada:{" "}
            {[user.municipalityName, user.departmentName].filter(Boolean).join(", ") ||
              "sin configurar"}{" "}
            ·{" "}
            <Link
              href="/panel/perfil"
              className="font-bold text-pacha-800 underline underline-offset-2"
            >
              actualizar
            </Link>
          </p>
        </CardBody>
      </Card>

      {!result || !result.ok || !result.data ? (
        <Card className="mt-5">
          <CardBody>
            <div className="flex flex-col items-center py-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-100 text-gold-800">
                <AlertTriangle className="h-7 w-7" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold">
                No hay información meteorológica actualizada
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/60">
                {result?.error ??
                  "Selecciona un municipio para consultar el clima."}{" "}
                No se muestran valores estimados ni pronósticos inventados.
              </p>
              {result?.notice && (
                <p className="mt-2 max-w-xl text-xs text-ink/45">
                  Detalle técnico: {result.notice}
                </p>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link
                  href={`/panel/clima?municipio=${selectedId}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pacha-800 px-4 py-2 text-sm font-bold text-white"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Volver a consultar
                </Link>
                <Link
                  href="/panel/clima"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-pacha-900/15 px-4 py-2 text-sm font-bold text-pacha-900"
                >
                  Cambiar ubicación
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden">
            <div className="relative overflow-hidden bg-pacha-900 p-6 text-white sm:p-7">
              <div className="absolute inset-0 topo-pattern opacity-70" aria-hidden />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold-300">
                      Condición actual
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                      {result.data.location.name}
                    </h2>
                    <p className="text-sm text-pacha-100/60">
                      {result.data.location.departmentName ?? "Bolivia"}
                    </p>
                  </div>
                  <Badge tone={result.data.isOfficial ? "green" : "gold"}>
                    {result.data.isOfficial ? "Fuente oficial" : "Fuente no oficial"}
                  </Badge>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <WeatherIcon
                    code={result.data.current.weatherCode}
                    className="h-14 w-14 text-gold-300"
                  />
                  <div>
                    <p className="font-display text-6xl font-semibold leading-none">
                      {Math.round(result.data.current.temperatureC)}°
                    </p>
                    <p className="mt-1 text-sm text-pacha-100/75">
                      {result.data.current.condition}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/8 p-2.5">
                    <Droplets className="h-4 w-4 text-pacha-200" aria-hidden />
                    <p className="mt-1 text-[10px] text-pacha-100/50">Humedad</p>
                    <p className="text-sm font-bold">
                      {round(result.data.current.humidity)}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/8 p-2.5">
                    <Wind className="h-4 w-4 text-pacha-200" aria-hidden />
                    <p className="mt-1 text-[10px] text-pacha-100/50">Viento</p>
                    <p className="text-sm font-bold">
                      {round(result.data.current.windKmh)} km/h
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/8 p-2.5">
                    <CloudRain className="h-4 w-4 text-pacha-200" aria-hidden />
                    <p className="mt-1 text-[10px] text-pacha-100/50">Lluvia</p>
                    <p className="text-sm font-bold">
                      {round(result.data.current.precipitationMm)} mm
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <CardBody>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/45">
                <span>
                  Actualizado: {formatDateTime(result.data.fetchedAt)} ·{" "}
                  {result.data.timezone}
                </span>
                <a
                  href={result.data.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-pacha-800"
                >
                  {result.data.sourceName}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </div>
              {result.notice && (
                <Alert tone="warning" className="mt-3">
                  {result.notice}
                </Alert>
              )}
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink/40">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                La información meteorológica es referencial y no reemplaza los
                avisos oficiales de las autoridades bolivianas.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<CloudRain className="h-4.5 w-4.5" />}
              title="Pronóstico disponible"
              description={`${result.data.daily.length} días · ${result.data.sourceName}`}
            />
            <CardBody className="space-y-2">
              {result.data.daily.map((day, index) => (
                <div
                  key={day.date}
                  className="flex items-center gap-3 rounded-xl border border-pacha-900/8 px-3 py-2.5"
                >
                  <WeatherIcon
                    code={day.weatherCode}
                    className="h-6 w-6 shrink-0 text-pacha-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold capitalize text-pacha-950">
                      {index === 0 ? "Hoy" : dayFormatter.format(new Date(`${day.date}T12:00:00`))}
                    </p>
                    <p className="truncate text-[10px] text-ink/45">
                      {day.condition}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">
                      {Math.round(day.tempMaxC)}° /{" "}
                      <span className="text-ink/45">{Math.round(day.tempMinC)}°</span>
                    </p>
                    <p className="text-[10px] text-ink/40">
                      {day.precipitationProbability !== null
                        ? `${day.precipitationProbability}% lluvia`
                        : `${day.precipitationMm} mm`}
                    </p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      <section id="alertas" className="mt-8 scroll-mt-24">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-gold-600" aria-hidden />
              Alertas registradas
            </h2>
            <p className="mt-1 text-xs text-ink/50">
              Solo se muestran alertas activas de tu departamento y de alcance
              nacional. Las alertas DEMO no son oficiales.
            </p>
          </div>
          <Badge tone="neutral">Fuente visible</Badge>
        </div>
        {alerts.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
              <WeatherAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            icon={<AlertTriangle className="h-5 w-5" />}
            title="No hay alertas activas para tu zona"
            description="No se inventan alertas. Cuando exista un aviso disponible con fuente y vigencia, aparecerá aquí."
          />
        )}
      </section>

      <div className="mt-8 rounded-2xl border border-pacha-900/10 bg-white p-5 text-sm">
        <p className="font-bold text-pacha-950">¿Prefieres consultar por WhatsApp?</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/55">
          Envía <code className="rounded bg-pacha-100 px-1.5 py-0.5 font-bold">CLIMA {municipality?.name ?? "Tu municipio"}</code>{" "}
          al número oficial cuando esté habilitado. También puedes responder{" "}
          <code className="rounded bg-pacha-100 px-1.5 py-0.5 font-bold">ALERTAS</code>{" "}
          o <code className="rounded bg-pacha-100 px-1.5 py-0.5 font-bold">BAJA</code>.
        </p>
      </div>
    </div>
  );
}
