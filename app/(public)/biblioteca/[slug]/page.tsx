import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Clock,
  ExternalLink,
  Sprout,
} from "lucide-react";
import { getContentBySlug, listEducationalContents } from "@/services/education";
import { RichText } from "@/components/content/rich-text";
import { ContentCard } from "@/components/education/content-card";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content) return { title: "Contenido no encontrado" };
  return { title: content.title, description: content.summary };
}

export default async function ContentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  if (!content) notFound();

  const related = (
    await listEducationalContents({
      cropId: content.cropId ?? undefined,
      categoryId: content.categoryId,
      limit: 4,
    })
  ).filter((item) => item.id !== content.id).slice(0, 3);

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/biblioteca"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver a la biblioteca
      </Link>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_310px]">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">{CONTENT_TYPE_LABELS[content.contentType]}</Badge>
            {content.isDemo && <DemoBadge />}
            {content.categoryName && <Badge tone="neutral">{content.categoryName}</Badge>}
            {content.cropName && (
              <Badge tone="neutral">
                <Sprout className="h-3 w-3" aria-hidden />
                {content.cropName}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/65">
            {content.summary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-pacha-900/10 py-3 text-xs text-ink/50">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {content.readingMinutes} min de lectura
            </span>
            <span>Actualizado {formatDate(content.updatedAt)}</span>
            {content.departmentName && <span>{content.departmentName}</span>}
          </div>

          {content.isDemo && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-gold-500/25 bg-gold-50 px-4 py-3 text-xs leading-relaxed text-gold-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Contenido DEMO con fines educativos. No constituye una
              recomendación agronómica oficial.
            </div>
          )}

          <div className="mt-6">
            <RichText content={content.body} />
          </div>

          {content.sourceNotes && (
            <div className="mt-8 rounded-2xl border border-pacha-900/10 bg-pacha-50 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-pacha-950">
                <BookOpen className="h-4 w-4 text-pacha-700" aria-hidden />
                Nota de fuente y alcance
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {content.sourceNotes}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink/50">
                Este material es de orientación general. Antes de tomar
                decisiones sobre insumos, dosis o manejo fitosanitario, consulte
                a un profesional autorizado y la normativa vigente.
              </p>
            </div>
          )}
        </article>

        <aside className="space-y-4">
          <div className="surface p-5">
            <p className="text-sm font-bold text-pacha-950">Ficha del contenido</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  Categoría
                </dt>
                <dd className="mt-0.5">{content.categoryName ?? "General"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  Cultivo
                </dt>
                <dd className="mt-0.5">{content.cropName ?? "Transversal"}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-ink/40">
                  Región
                </dt>
                <dd className="mt-0.5">
                  {content.departmentName ?? "Aplicable a Bolivia"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gold-500/25 bg-gold-50 p-5 text-sm leading-relaxed text-gold-900">
            <p className="font-bold">Advertencia</p>
            <p className="mt-1.5 text-xs">
              PACHAAGRO no presenta recomendaciones no verificadas como
              instrucciones oficiales. Valida siempre con tu técnico o
              asociación.
            </p>
          </div>

          <Link
            href="/registro"
            className="flex items-center justify-between rounded-2xl bg-pacha-900 p-5 text-sm font-bold text-white transition hover:bg-pacha-950"
          >
            Recibir guías de mi cultivo
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t border-pacha-900/10 pt-8">
          <h2 className="font-display text-2xl font-semibold">
            Contenidos relacionados
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                href={`/biblioteca/${item.slug}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
