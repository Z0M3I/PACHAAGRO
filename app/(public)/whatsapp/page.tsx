import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CheckCircle2,
  CloudSun,
  FlaskConical,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Sprout,
  XCircle,
} from "lucide-react";
import {
  isWhatsAppConfigured,
  isWhatsAppSimulation,
} from "@/lib/env";
import { TEMPLATE_CONTRACTS } from "@/services/whatsapp/templates";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Bot de WhatsApp",
  description:
    "Cómo funciona la integración oficial de PACHAAGRO con WhatsApp Cloud API: comandos, consentimiento, plantillas y baja.",
};

const commands = [
  { command: "CLIMA Punata", description: "Clima actual y pronóstico disponible para un municipio." },
  { command: "ALERTAS", description: "Alertas activas registradas para tu zona." },
  { command: "CULTIVOS", description: "Cultivos que registraste en tu perfil." },
  { command: "CONTENIDO", description: "Guías educativas publicadas recientemente." },
  { command: "ALTA", description: "Activar notificaciones de la plataforma." },
  { command: "BAJA", description: "Desactivar notificaciones y mensajes proactivos." },
  { command: "AYUDA", description: "Mostrar el menú de comandos." },
];

export default function WhatsAppPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver al inicio
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="eyebrow">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            WhatsApp Cloud API
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
            El campo conversa. Nosotros escuchamos.
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-ink/65">
            PACHAAGRO usa exclusivamente la API oficial de WhatsApp Cloud de
            Meta. No automatiza WhatsApp Web ni utiliza canales no oficiales.
            Cada mensaje proactivo respeta el consentimiento y las plantillas
            aprobadas.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Consentimiento explícito",
                text: "Solo escribimos a quienes activaron las notificaciones.",
              },
              {
                icon: XCircle,
                title: "Baja en un paso",
                text: "La palabra BAJA detiene los mensajes proactivos.",
              },
              {
                icon: BellRing,
                title: "Plantillas aprobadas",
                text: "Los avisos iniciados por la plataforma usan plantillas de Meta.",
              },
              {
                icon: CheckCircle2,
                title: "Trazabilidad",
                text: "Registramos estado de envío, entrega y errores disponibles.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-pacha-900/10 bg-white p-4 shadow-sm"
              >
                <item.icon className="h-5 w-5 text-pacha-700" aria-hidden />
                <p className="mt-2 text-sm font-bold text-pacha-950">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink/55">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {isWhatsAppSimulation && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-gold-500/30 bg-gold-50 px-5 py-4 text-sm text-gold-900">
              <FlaskConical className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p>
                <strong>Integración en modo simulación.</strong> No hay
                credenciales de Meta configuradas. Los envíos de prueba se
                registran como SIMULADOS y la interfaz nunca afirma que se
                entregó un mensaje real.
              </p>
            </div>
          )}

          {!isWhatsAppConfigured && !isWhatsAppSimulation && (
            <div className="mt-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p>
                La integración está deshabilitada porque faltan credenciales y
                la simulación está apagada. El administrador debe configurar
                las variables de WhatsApp.
              </p>
            </div>
          )}

          <h2 className="mt-10 font-display text-2xl font-semibold">
            Comandos disponibles
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-pacha-900/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-pacha-50 text-[11px] uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-bold">Comando</th>
                  <th className="px-4 py-3 font-bold">Qué hace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pacha-900/8">
                {commands.map((item) => (
                  <tr key={item.command}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-pacha-800">
                      {item.command}
                    </td>
                    <td className="px-4 py-3 text-ink/65">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-3xl bg-pacha-950 p-5 text-white shadow-lift">
            <div className="absolute inset-0 topo-pattern opacity-60" aria-hidden />
            <div className="relative">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-400 text-pacha-950">
                  <Leaf className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold">PACHAAGRO</p>
                  <p className="text-[10px] text-pacha-100/50">
                    Asistente oficial · demostración
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2.5 text-xs">
                <p className="ml-auto w-fit rounded-2xl rounded-br-sm bg-pacha-600 px-3.5 py-2">
                  HOLA
                </p>
                <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2 text-pacha-50">
                  PACHAAGRO 🌱 Comandos: CLIMA, ALERTAS, CULTIVOS, CONTENIDO,
                  ALTA, BAJA.
                </p>
                <p className="ml-auto w-fit rounded-2xl rounded-br-sm bg-pacha-600 px-3.5 py-2">
                  ALERTAS
                </p>
                <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2 text-pacha-50">
                  No hay alertas activas registradas para tu zona. No
                  reemplaza los avisos oficiales.
                </p>
              </div>
            </div>
          </div>

          <div className="surface p-5">
            <p className="text-sm font-bold text-pacha-950">
              Plantillas de mensajes
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink/55">
              Nombres configurables. Deben existir y estar aprobadas en Meta
              Business Manager.
            </p>
            <ul className="mt-4 space-y-3">
              {TEMPLATE_CONTRACTS.map((template) => (
                <li key={template.kind} className="text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{template.kind}</Badge>
                    <code className="break-all text-[10px] text-ink/50">
                      {template.name}
                    </code>
                  </div>
                  <p className="mt-1 whitespace-pre-line leading-relaxed text-ink/60">
                    {template.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-pacha-900/10 bg-pacha-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-pacha-950">
              <CloudSun className="h-4 w-4 text-pacha-700" aria-hidden />
              Transparencia primero
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink/60">
              Cuando una consulta climática falla, el bot responde que no hay
              información actualizada. Nunca inventa temperaturas ni
              pronósticos.
            </p>
          </div>

          <ButtonLink href="/registro" className="w-full">
            <Sprout className="h-4 w-4" aria-hidden />
            Registrarme y activar avisos
          </ButtonLink>
        </aside>
      </div>
    </div>
  );
}
