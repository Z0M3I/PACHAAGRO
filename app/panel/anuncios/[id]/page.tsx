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
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { isStaffRole } from "@/lib/auth/permissions";
import { getAnnouncementById } from "@/services/announcements";
import { RichText } from "@/components/content/rich-text";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ANNOUNCEMENT_TYPE_LABELS, locationLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalle del anuncio" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PanelAnnouncementPage({ params }: PageProps) {
  const user = await requireUser("/panel/anuncios");
  const { id } = await params;
  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();
  if (!announcement.isPublished && !isStaffRole(user.role)) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel/anuncios"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver a anuncios
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="green">{ANNOUNCEMENT_TYPE_LABELS[announcement.type]}</Badge>
        {announcement.isDemo && <DemoBadge />}
        {!announcement.isPublished && <Badge tone="gold">Borrador</Badge>}
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
      <p className="mt-3 text-pretty text-lg leading-relaxed text-ink/65">
        {announcement.summary}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-pacha-900/10 py-3 text-xs text-ink/50">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {locationLabel(announcement)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          {formatDateTime(announcement.publishedAt ?? announcement.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Megaphone className="h-3.5 w-3.5" aria-hidden />
          {announcement.authorName ?? "Equipo PACHAAGRO"}
        </span>
      </div>

      {announcement.isDemo && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-500/25 bg-gold-50 px-4 py-3 text-xs leading-relaxed text-gold-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Contenido DEMO. No es un comunicado oficial ni una convocatoria real.
        </div>
      )}

      <div className="mt-6">
        <RichText content={announcement.body} />
      </div>

      {announcement.expiresAt && (
        <p className="mt-8 rounded-xl bg-pacha-50 px-4 py-3 text-xs text-ink/55">
          Vigencia: hasta {formatDateTime(announcement.expiresAt)}.
        </p>
      )}
    </div>
  );
}
