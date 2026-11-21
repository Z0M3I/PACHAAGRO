import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CloudSun,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import { getDepartments, getCrops } from "@/services/reference";
import { listAnnouncements } from "@/services/announcements";
import { listEducationalContents } from "@/services/education";
import { listWeatherAlerts } from "@/services/weather-alerts";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { ContentCard } from "@/components/education/content-card";
import { WeatherAlertCard } from "@/components/weather/weather-alert-card";
import { CoverageMap } from "@/components/maps/coverage-map";
import { ButtonLink } from "@/components/ui/button";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Comunicación y educación agrícola para Bolivia",
};

const benefits = [
  {
    icon: BellRing,
    title: "Alertas que llegan a tiempo",
    text: "Avisos climáticos y comunicados con ubicación, vigencia y fuente visible. Sin pronósticos inventados.",
    tag: "Comunicación",
  },
  {
    icon: Users,
    title: "La voz de la comunidad",
    text: "Reuniones, asambleas y anuncios organizados por departamento, municipio, comunidad y cultivo.",
    tag: "Comunidad",
  },
  {
    icon: BookOpen,
    title: "Aprender para decidir",
    text: "Guías de siembra, cuidado, plagas y conservación de suelos, con notas de fuente y advertencias.",
    tag: "Educación",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp sin complicaciones",
    text: "Información por la vía que ya se usa. Integración exclusiva con la API oficial de Meta y consentimiento explícito.",
    tag: "Cercanía",
  },
];

const steps = [
  {
    icon: ClipboardList,
    title: "Registra tu cuenta",
    text: "Nombre, teléfono y ubicación. Tú decides si quieres recibir mensajes de WhatsApp.",
  },
  {
    icon: Sprout,
    title: "Cuéntanos qué produces",
    text: "Selecciona tus cultivos de interés para recibir información pertinente a tu trabajo.",
  },
  {
    icon: BellRing,
    title: "Recibe lo que importa",
    text: "Consulta clima, alertas, anuncios y guías desde el celular o por WhatsApp.",
  },
];

export default async function LandingPage() {
  const [alerts, announcements, contents, departments, crops] =
    await Promise.all([
      listWeatherAlerts({ limit: 3 }),
      listAnnouncements({ limit: 3 }),
      listEducationalContents({ limit: 3 }),
      getDepartments(),
      getCrops(),
    ]);

  const featuredAlert = alerts[0];

  return (
    <div>
      {/* HERO */}
      <section className="container-page pt-5 sm:pt-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-pacha-950 px-5 py-10 text-white sm:rounded-[2.75rem] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute inset-0 topo-pattern opacity-90" aria-hidden />
          <div className="pointer-events-none absolute inset-0 grain-overlay opacity-30" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div className="animate-fade-up">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-200">
                <Leaf className="h-3.5 w-3.5" aria-hidden />
                Tecnología con raíz boliviana
              </p>
              <h1 className="text-balance font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[4.3rem]">
                La información del campo,{" "}
                <span className="italic text-gold-300">cuando llega.</span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-pacha-100/75 sm:text-lg">
                PACHAAGRO conecta a productores agrícolas de Bolivia con
                alertas, anuncios comunitarios, reuniones y contenido
                educativo. En la web y en WhatsApp, con la fuente siempre a la
                vista.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/registro" variant="gold" size="lg">
                  Crear mi cuenta
                  <ArrowRight className="h-4.5 w-4.5" aria-hidden />
                </ButtonLink>
                <ButtonLink
                  href="#beneficios"
                  size="lg"
                  className="border border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  Conocer la plataforma
                </ButtonLink>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-pacha-100/60">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                  9 departamentos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                  Consentimiento explícito
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold-300" aria-hidden />
                  Fuente y fecha visibles
                </span>
              </div>
            </div>

            {/* Panel ilustrativo */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-4 top-8 h-28 w-28 rounded-full bg-gold-400/20 blur-2xl" aria-hidden />
              <div className="relative rounded-[1.6rem] bg-cream p-4 text-ink shadow-lift sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pacha-700">
                      Hoy en el campo
                    </p>
                    <p className="font-display text-lg font-semibold text-pacha-950">
                      Tu resumen
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-pacha-100 px-2.5 py-1 text-[10px] font-bold text-pacha-800">
                    <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-pacha-600" />
                    DEMO
                  </span>
                </div>

                {featuredAlert ? (
                  <div className="mt-4 rounded-2xl border border-gold-500/25 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="gold">Alerta climática</Badge>
                      <span className="text-[10px] font-semibold text-ink/40">
                        {formatDate(featuredAlert.startsAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-snug text-pacha-950">
                      {featuredAlert.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/55">
                      {featuredAlert.municipalityName ??
                        featuredAlert.departmentName ??
                        "Toda Bolivia"}{" "}
                      · datos de demostración
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-pacha-900/10 bg-white p-4 text-sm text-ink/60">
                    No hay alertas activas. Se mostrará la información cuando
                    una fuente disponible la publique.
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-pacha-900/10 bg-white p-3.5">
                    <CloudSun className="h-5 w-5 text-pacha-700" aria-hidden />
                    <p className="mt-2 text-xs font-bold text-pacha-950">
                      Clima con fuente
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink/50">
                      Hora y proveedor visibles.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-pacha-900/10 bg-white p-3.5">
                    <MessageCircle className="h-5 w-5 text-pacha-700" aria-hidden />
                    <p className="mt-2 text-xs font-bold text-pacha-950">
                      Tu comunidad
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink/50">
                      Avisos y reuniones.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-pacha-800 px-3.5 py-3 text-white">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                    <BellRing className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold">Recordatorio de reunión</p>
                    <p className="truncate text-[10px] text-white/60">
                      Coordinación de la campaña de papa
                    </p>
                  </div>
                  <DemoBadge />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cifras */}
        <div className="relative z-10 mx-3 -mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-pacha-900/10 bg-pacha-900/10 shadow-soft sm:mx-8 sm:grid-cols-4">
          {[
            { value: "9", label: "departamentos" },
            { value: String(crops.length), label: "cultivos priorizados" },
            { value: "API", label: "oficial de WhatsApp" },
            { value: "100%", label: "fuentes identificadas" },
          ].map((item) => (
            <div key={item.label} className="bg-white px-4 py-4 text-center">
              <p className="font-display text-2xl font-semibold text-pacha-900">
                {item.value}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/45">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="container-page scroll-mt-24 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Una herramienta, cuatro raíces</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Información útil para decidir, compartir y aprender.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-ink/60">
            No es un panel más. Es un puente entre la comunidad, el técnico, la
            asociación y cada familia productora.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className="group relative overflow-hidden rounded-3xl border border-pacha-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pacha-100 text-pacha-800">
                  <benefit.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-sm font-semibold text-pacha-900/25">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-pacha-700">
                {benefit.tag}
              </p>
              <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {benefit.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ALERTAS */}
      <section className="border-y border-pacha-900/8 bg-pacha-50/60 py-20 sm:py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">
                <BellRing className="h-3.5 w-3.5" aria-hidden />
                Centro de comunicación
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
                Alertas con contexto, no rumores.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/60">
                Cada alerta muestra su severidad, ubicación, vigencia y fuente.
                Si no hay información actualizada, lo decimos con claridad.
              </p>
            </div>
            <ButtonLink href="/alertas" variant="outline">
              Ver todas las alertas
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>

          {alerts.length > 0 ? (
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {alerts.map((alert) => (
                <WeatherAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-9 bg-white/60"
              icon={<CloudSun className="h-5 w-5" />}
              title="No hay alertas activas"
              description="Cuando una fuente disponible publique una alerta, aparecerá aquí con su fecha y procedencia."
            />
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pacha-900/10 bg-white px-5 py-4 text-sm">
            <p className="flex items-center gap-2 text-ink/60">
              <CalendarDays className="h-4 w-4 text-pacha-700" aria-hidden />
              Reuniones comunitarias y avisos de asociaciones, en un solo lugar.
            </p>
            <Link
              href="/registro"
              className="inline-flex items-center gap-1 font-bold text-pacha-800 hover:text-pacha-950"
            >
              Recibir avisos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* EDUCACIÓN */}
      <section className="container-page py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Biblioteca agrícola
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
              Aprender también es parte de la cosecha.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/60">
              Guías de siembra, cuidados, plagas, calendarios y conservación de
              suelos. Contenido filtrable por cultivo, departamento, categoría y
              tipo.
            </p>
            <div className="mt-5 space-y-2 text-sm text-ink/70">
              {[
                "Advertencias cuando el contenido es general",
                "Notas de fuente visibles",
                "Organizado por cultivo y región",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-pacha-600" aria-hidden />
                  {item}
                </p>
              ))}
            </div>
            <ButtonLink href="/biblioteca" variant="secondary" className="mt-6">
              Explorar biblioteca
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contents.slice(0, 2).map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                href={`/biblioteca/${content.slug}`}
              />
            ))}
            {contents[2] && (
              <div className="sm:col-span-2">
                <ContentCard
                  content={contents[2]}
                  href={`/biblioteca/${contents[2].slug}`}
                  className="sm:flex-row sm:items-stretch"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COMUNICADOS */}
      <section className="border-y border-pacha-900/8 bg-cream py-20 sm:py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Anuncios y comunidad
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
                Lo que se conversa en la comunidad también se organiza.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink/60">
                Comunicados, ferias, asambleas y avisos de asociaciones,
                dirigidos a toda Bolivia o a una comunidad específica.
              </p>
            </div>
            <ButtonLink href="/alertas" variant="outline">
              Ver comunicados
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </div>
          {announcements.length > 0 ? (
            <div className="mt-9 grid gap-4 md:grid-cols-3">
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
              className="mt-9 bg-white/60"
              icon={<Users className="h-5 w-5" />}
              title="Todavía no hay comunicados publicados"
              description="Las asociaciones y el equipo de contenido podrán publicarlos desde el panel administrativo."
            />
          )}
        </div>
      </section>

      {/* WHATSAPP */}
      <section id="whatsapp" className="container-page scroll-mt-24 pb-20 sm:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-pacha-900 p-6 text-white sm:rounded-[2.5rem] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 topo-pattern opacity-70" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-pacha-200">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                WhatsApp oficial
              </p>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Donde ya está la conversación.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-pacha-100/70">
                La plataforma usa exclusivamente la API oficial de WhatsApp
                Cloud de Meta. Nunca automatizaciones de WhatsApp Web. Tú das
                el consentimiento y puedes darte de baja con una palabra.
              </p>
              <div className="mt-6 grid gap-2.5 text-sm text-pacha-100/80 sm:grid-cols-2">
                {[
                  "Comandos simples: CLIMA, ALERTAS, CULTIVOS",
                  "Plantillas aprobadas para avisos",
                  "BAJA para dejar de recibir mensajes",
                  "Registro de cada envío y su estado",
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />
                    {item}
                  </p>
                ))}
              </div>
              <ButtonLink href="/whatsapp" variant="gold" className="mt-7">
                Cómo funciona el bot
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            </div>

            <div className="mx-auto w-full max-w-sm">
              <div className="rounded-[2rem] border border-white/15 bg-cream p-3 shadow-lift">
                <div className="flex items-center gap-3 rounded-t-[1.4rem] bg-pacha-950 px-4 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-400 text-pacha-950">
                    <Leaf className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-bold">PACHAAGRO</p>
                    <p className="text-[10px] text-pacha-100/50">
                      Asistente oficial · ejemplo
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5 px-2 py-4">
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-pacha-700 px-3.5 py-2 text-xs text-white">
                    CLIMA Punata
                  </p>
                  <p className="w-fit max-w-[88%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-xs text-ink/75 shadow-sm">
                    Clima en Punata (Cochabamba). Datos con fecha de
                    actualización y fuente visible. No reemplaza los avisos
                    oficiales.
                  </p>
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-pacha-700 px-3.5 py-2 text-xs text-white">
                    ALERTAS
                  </p>
                  <p className="w-fit max-w-[88%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-xs text-ink/75 shadow-sm">
                    No hay alertas activas registradas para tu zona. Responde
                    BAJA para no recibir mensajes.
                  </p>
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] uppercase tracking-wide text-pacha-100/40">
                Conversación ilustrativa · no es un mensaje real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section id="cobertura" className="scroll-mt-24 border-y border-pacha-900/8 bg-white py-20 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Cobertura nacional
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
              De los Andes al Chaco, con la misma información clara.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/60">
              La plataforma organiza el contenido por departamento, municipio y
              comunidad. La disponibilidad de alertas depende de las fuentes
              oficiales y de la información registrada por cada comunidad.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {departments.map((department) => (
                <span
                  key={department.id}
                  className="rounded-full border border-pacha-900/10 bg-pacha-50 px-3 py-1.5 text-xs font-semibold text-pacha-900"
                >
                  {department.name}
                </span>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-gold-500/25 bg-gold-50 p-4 text-xs leading-relaxed text-gold-900">
              <strong>Transparencia:</strong> los datos DEMO están identificados
              con una etiqueta. Los pronósticos muestran proveedor y hora de
              actualización; si una fuente falla, no se inventan valores.
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.4rem] border border-pacha-900/10 bg-pacha-100 p-1.5 shadow-card">
            <CoverageMap departments={departments} />
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="container-page py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Tres pasos</p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Empezar es tan simple como sembrar.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-3xl border border-pacha-900/10 bg-white p-6 shadow-sm"
            >
              <span className="absolute right-5 top-5 font-display text-4xl font-semibold text-pacha-900/10">
                {index + 1}
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pacha-800 text-white">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-page pb-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gold-400 px-6 py-10 text-pacha-950 sm:rounded-[2.5rem] sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[32px] border-pacha-950/10" aria-hidden />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-pacha-900/65">
                La información también es una herramienta de cosecha
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Tu comunidad, tus cultivos y tu clima. En un solo lugar.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-pacha-950/70">
                Únete a PACHAAGRO y decide con información clara, oportuna y
                con fuente visible.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/registro" size="lg">
                Registrarme
                <ArrowRight className="h-4.5 w-4.5" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href="/login"
                size="lg"
                variant="outline"
                className="border-pacha-950/25 text-pacha-950 hover:bg-pacha-950/5"
              >
                Ya tengo cuenta
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
