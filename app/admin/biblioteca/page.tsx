import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Pencil,
  PlusCircle,
} from "lucide-react";
import { requireAdminPanel } from "@/lib/auth/session";
import { listEducationalContents } from "@/services/education";
import { deleteContentAction } from "@/features/admin/actions";
import { DeleteButton } from "@/features/admin/components/delete-button";
import { NotifyButton } from "@/features/admin/components/notify-button";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/empty-state";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Biblioteca administrativa" };

interface PageProps {
  searchParams: Promise<{ ok?: string }>;
}

export default async function AdminLibraryPage({ searchParams }: PageProps) {
  const user = await requireAdminPanel("/admin/biblioteca");
  const params = await searchParams;
  const contents = await listEducationalContents({
    includeUnpublished: true,
    limit: 200,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Educación agrícola"
        title="Biblioteca"
        description="Contenido educativo administrable. Incluye notas de fuente para no presentar recomendaciones generales como instrucciones oficiales."
        actions={
          <ButtonLink href="/admin/biblioteca/nuevo" size="sm">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Nuevo contenido
          </ButtonLink>
        }
      />

      {params.ok && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-pacha-700/20 bg-pacha-50 px-4 py-3 text-sm text-pacha-900">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Contenido {params.ok === "creado" ? "creado" : "actualizado"}{" "}
          correctamente.
        </div>
      )}

      {contents.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-pacha-900/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-pacha-50/80 text-[10px] uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-4 py-3 font-bold">Contenido</th>
                  <th className="px-4 py-3 font-bold">Categoría</th>
                  <th className="px-4 py-3 font-bold">Estado</th>
                  <th className="px-4 py-3 font-bold">Actualizado</th>
                  <th className="px-4 py-3 text-right font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pacha-900/8">
                {contents.map((content) => (
                  <tr key={content.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">
                          {CONTENT_TYPE_LABELS[content.contentType]}
                        </Badge>
                        {content.isDemo && <DemoBadge />}
                      </div>
                      <p className="mt-1 max-w-sm font-bold leading-snug text-pacha-950">
                        {content.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink/45">
                        {content.cropName ?? "Transversal"} ·{" "}
                        {content.readingMinutes} min
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink/60">
                      {content.categoryName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={content.isPublished ? "green" : "gold"}>
                        {content.isPublished ? "Publicado" : "Borrador"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-ink/50">
                      {formatDate(content.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {content.isPublished && (
                          <Link
                            href={`/biblioteca/${content.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-pacha-800 hover:bg-pacha-50"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                            Ver
                          </Link>
                        )}
                        <ButtonLink
                          href={`/admin/biblioteca/${content.id}`}
                          variant="ghost"
                          size="sm"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Editar
                        </ButtonLink>
                        {user.role === "admin" && (
                          <NotifyButton
                            kind="educational"
                            id={content.id}
                            label="Compartir"
                          />
                        )}
                        <DeleteButton
                          action={deleteContentAction.bind(null, content.id)}
                          confirmMessage="¿Eliminar este contenido educativo?"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          icon={<BookOpen className="h-5 w-5" />}
          title="No hay contenidos"
          description="Crea la primera guía o ficha de cultivo para la biblioteca."
          action={
            <ButtonLink href="/admin/biblioteca/nuevo" size="sm">
              <PlusCircle className="h-4 w-4" aria-hidden />
              Nuevo contenido
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
