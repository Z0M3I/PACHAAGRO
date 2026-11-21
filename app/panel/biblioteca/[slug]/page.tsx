import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Clock,
  Pencil,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { canManageContent } from "@/lib/auth/permissions";
import { getContentBySlug } from "@/services/education";
import { RichText } from "@/components/content/rich-text";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Contenido educativo" };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PanelContentDetailPage({ params }: PageProps) {
  const user = await requireUser("/panel/biblioteca");
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/panel/biblioteca"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver a la biblioteca
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone="green">{CONTENT_TYPE_LABELS[content.contentType]}</Badge>
        {content.isDemo && <DemoBadge />}
        {content.categoryName && <Badge tone="neutral">{content.categoryName}</Badge>}
        {content.cropName && <Badge tone="neutral">{content.cropName}</Badge>}
        {canManageContent(user.role) && (
          <Link
            href={`/admin/biblioteca/${content.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-pacha-800/20 px-2.5 py-0.5 text-[11px] font-bold text-pacha-800"
          >
            <Pencil className="h-3 w-3" aria-hidden />
            Editar
          </Link>
        )}
      </div>

      <h1 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
        {content.title}
      </h1>
      <p className="mt-3 text-pretty text-lg leading-relaxed text-ink/65">
        {content.summary}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-pacha-900/10 py-3 text-xs text-ink/50">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {content.readingMinutes} min
        </span>
        <span>Actualizado {formatDate(content.updatedAt)}</span>
        {content.departmentName && <span>{content.departmentName}</span>}
      </div>

      {content.isDemo && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-500/25 bg-gold-50 px-4 py-3 text-xs leading-relaxed text-gold-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Contenido DEMO de orientación general. No es una recomendación
          agronómica oficial.
        </div>
      )}

      <div className="mt-6">
        <RichText content={content.body} />
      </div>

      {content.sourceNotes && (
        <div className="mt-8 rounded-2xl border border-pacha-900/10 bg-pacha-50 p-5 text-sm leading-relaxed text-ink/65">
          <p className="flex items-center gap-2 font-bold text-pacha-950">
            <BookOpen className="h-4 w-4 text-pacha-700" aria-hidden />
            Nota de fuente
          </p>
          <p className="mt-2">{content.sourceNotes}</p>
          <p className="mt-2 text-xs text-ink/45">
            Consulta a un profesional autorizado antes de aplicar tratamientos o
            insumos.
          </p>
        </div>
      )}
    </div>
  );
}
