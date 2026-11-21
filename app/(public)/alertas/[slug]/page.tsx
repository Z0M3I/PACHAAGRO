import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  MapPin,
  Megaphone,
  Sprout,
  Users,
} from "lucide-react";
import { getAnnouncementBySlug } from "@/services/announcements";
import { RichText } from "@/components/content/rich-text";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ANNOUNCEMENT_TYPE_LABELS, locationLabel } from "@/lib/labels";
import { formatDate, formatDateTime } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);
  if (!announcement) return { title: "Comunicado no encontrado" };
  return {
    title: announcement.title,
    description: announcement.summary,
  };
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);
  if (!announcement) notFound();

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/alertas"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver a alertas y comunicados
      </Link>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">
              {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
            </Badge>
            {announcement.isDemo && <DemoBadge />}
            {announcement.cropName && (
              <Badge tone="neutral">
                <Sprout className="h-3 w-3" aria-hidden />
                {announcement.cropName}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {announcement.title}
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            {announcement.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-pacha-900/10 py-3 text-xs text-ink/50">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {locationLabel(announcement)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Publicado {formatDate(announcement.publishedAt ?? announcement.createdAt)}
            </span>
            {announcement.authorName && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden />
                {announcement.authorName}
              </span>
            )}
          </div>

          {announcement.isDemo && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-500/25 bg-gold-50 px-4 py-3 text-xs leading-relaxed text-gold-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Este es un contenido de demostración. No fue emitido por una
              autoridad oficial ni por una asociación real.
            </div>
          )}

          <div className="mt-6">
            <RichText content={announcement.body} />
          </div>
        </article>

        <aside className="space-y-4">
          <div className="surface p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-pacha-950">
              <Megaphone className="h-4 w-4 text-pacha-700" aria-hidden />
              Detalles del aviso
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  Alcance
                </dt>
                <dd className="mt-0.5 font-semibold">
                  {locationLabel(announcement)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  Publicación
                </dt>
                <dd className="mt-0.5">
                  {formatDateTime(announcement.publishedAt ?? announcement.createdAt)}
                </dd>
              </div>
              {announcement.expiresAt && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                    Vigencia
                  </dt>
                  <dd className="mt-0.5">
                    Hasta {formatDateTime(announcement.expiresAt)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  Origen
                </dt>
                <dd className="mt-0.5">
                  {announcement.isDemo
                    ? "Datos DEMO de la plataforma"
                    : announcement.authorName ?? "Equipo PACHAAGRO"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-pacha-900/10 bg-pacha-50 p-5 text-sm leading-relaxed text-ink/65">
            <p className="font-bold text-pacha-950">Recibe información de tu zona</p>
            <p className="mt-1.5 text-xs">
              Configura tu departamento, municipio y cultivos para filtrar mejor
              los comunicados.
            </p>
            <Link
              href="/registro"
              className="mt-3 inline-flex text-xs font-bold text-pacha-800 underline underline-offset-2"
            >
              Crear mi cuenta
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
