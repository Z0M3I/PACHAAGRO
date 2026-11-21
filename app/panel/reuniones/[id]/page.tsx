import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Video,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getMeetingById } from "@/services/meetings";
import { RichText } from "@/components/content/rich-text";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalle de la reunión" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PanelMeetingDetailPage({ params }: PageProps) {
  await requireUser("/panel/reuniones");
  const { id } = await params;
  const meeting = await getMeetingById(id);
  if (!meeting) notFound();

  const safeVirtualUrl =
    meeting.isVirtual &&
    meeting.virtualUrl &&
    /^https:\/\//.test(meeting.virtualUrl)
      ? meeting.virtualUrl
      : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel/reuniones"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver a reuniones
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="green">
          <CalendarDays className="h-3 w-3" aria-hidden />
          Reunión
        </Badge>
        {meeting.isDemo && <DemoBadge />}
        {meeting.isVirtual && (
          <Badge tone="blue">
            <Video className="h-3 w-3" aria-hidden />
            Virtual
          </Badge>
        )}
      </div>

      <h1 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {meeting.title}
      </h1>

      <div className="mt-5 grid gap-3 rounded-2xl border border-pacha-900/10 bg-white p-5 text-sm sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-pacha-700" aria-hidden />
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-ink/40">
              Fecha y hora
            </span>
            {formatDateTime(meeting.startsAt)}
            {meeting.endsAt && ` – ${formatDateTime(meeting.endsAt)}`}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pacha-700" aria-hidden />
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-ink/40">
              Lugar
            </span>
            {meeting.location}
          </span>
        </p>
      </div>

      {safeVirtualUrl && (
        <a
          href={safeVirtualUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-pacha-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-pacha-900"
        >
          <Video className="h-4 w-4" aria-hidden />
          Abrir enlace de la reunión
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}

      {meeting.isDemo && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-500/25 bg-gold-50 px-4 py-3 text-xs leading-relaxed text-gold-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Reunión DEMO. No corresponde a una convocatoria real. El enlace
          virtual es ilustrativo.
        </div>
      )}

      <div className="mt-6">
        <RichText content={meeting.description} />
      </div>

      {(meeting.communityName || meeting.municipalityName || meeting.departmentName) && (
        <p className="mt-8 text-xs text-ink/45">
          Alcance:{" "}
          {[meeting.communityName, meeting.municipalityName, meeting.departmentName]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
