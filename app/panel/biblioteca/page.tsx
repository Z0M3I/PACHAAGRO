import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Filter, Search } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listEducationalContents } from "@/services/education";
import {
  getContentCategories,
  getCrops,
} from "@/services/reference";
import { ContentCard } from "@/components/education/content-card";
import { EmptyState, PageHeader } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";

export const metadata: Metadata = { title: "Biblioteca" };

interface PageProps {
  searchParams: Promise<{
    cultivo?: string;
    categoria?: string;
    tipo?: string;
    q?: string;
  }>;
}

export default async function PanelLibraryPage({ searchParams }: PageProps) {
  const user = await requireUser("/panel/biblioteca");
  const params = await searchParams;
  const [contents, crops, categories] = await Promise.all([
    listEducationalContents({
      cropId: params.cultivo,
      categoryId: params.categoria,
      contentType: params.tipo,
      search: params.q,
      limit: 60,
    }),
    getCrops(),
    getContentCategories(),
  ]);

  const hasFilters = Boolean(
    params.cultivo || params.categoria || params.tipo || params.q,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Educación agrícola"
        title="Biblioteca del productor"
        description="Guías y fichas de orientación general. Revisa las notas de fuente y consulta a tu técnico antes de tomar decisiones de manejo."
      />

      {user.cropIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink/50">
          <span>Tus cultivos:</span>
          {crops
            .filter((crop) => user.cropIds.includes(crop.id))
            .map((crop) => (
              <Link
                key={crop.id}
                href={`/panel/biblioteca?cultivo=${crop.id}`}
                className="rounded-full border border-pacha-800/20 bg-pacha-100 px-2.5 py-1 text-[11px] font-bold text-pacha-900"
              >
                {crop.name}
              </Link>
            ))}
        </div>
      )}

      <form
        method="get"
        className="rounded-2xl border border-pacha-900/10 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="q">Buscar</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink/35"
                aria-hidden
              />
              <Input
                id="q"
                name="q"
                placeholder="Palabra clave"
                defaultValue={params.q ?? ""}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cultivo">Cultivo</Label>
            <Select id="cultivo" name="cultivo" defaultValue={params.cultivo ?? ""}>
              <option value="">Todos</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <Select
              id="categoria"
              name="categoria"
              defaultValue={params.categoria ?? ""}
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select id="tipo" name="tipo" defaultValue={params.tipo ?? ""}>
              <option value="">Todos</option>
              {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm">
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Filtrar
          </Button>
          {hasFilters && (
            <Link
              href="/panel/biblioteca"
              className="text-xs font-bold text-pacha-800 underline underline-offset-2"
            >
              Limpiar
            </Link>
          )}
          <span className="ml-auto text-xs text-ink/45">
            {contents.length} contenidos
          </span>
        </div>
      </form>

      {contents.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              href={`/panel/biblioteca/${content.slug}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          icon={<BookOpen className="h-5 w-5" />}
          title="No hay contenidos con esos filtros"
          description="Prueba otra combinación de cultivo, categoría o tipo."
        />
      )}
    </div>
  );
}
