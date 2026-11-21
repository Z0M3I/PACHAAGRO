import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Filter, Search } from "lucide-react";
import { listEducationalContents } from "@/services/education";
import {
  getContentCategories,
  getCrops,
  getDepartments,
} from "@/services/reference";
import { ContentCard } from "@/components/education/content-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Biblioteca educativa agrícola",
  description:
    "Guías de siembra, cuidados, calendarios, plagas y conservación de suelos para productores de Bolivia.",
};

interface PageProps {
  searchParams: Promise<{
    cultivo?: string;
    departamento?: string;
    categoria?: string;
    tipo?: string;
    q?: string;
  }>;
}

export default async function LibraryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [contents, crops, departments, categories] = await Promise.all([
    listEducationalContents({
      cropId: params.cultivo,
      departmentId: params.departamento,
      categoryId: params.categoria,
      contentType: params.tipo,
      search: params.q,
      limit: 60,
    }),
    getCrops(),
    getDepartments(),
    getContentCategories(),
  ]);

  const hasFilters = Boolean(
    params.cultivo ||
      params.departamento ||
      params.categoria ||
      params.tipo ||
      params.q,
  );

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-pacha-800 hover:text-pacha-950"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Volver al inicio
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="eyebrow">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          Biblioteca educativa
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
          Conocimiento para el campo boliviano.
        </h1>
        <p className="mt-3 text-pretty text-base leading-relaxed text-ink/60">
          Contenido de orientación general. No sustituye la asistencia técnica
          ni las recomendaciones de un profesional. Revisa siempre las notas de
          fuente de cada guía.
        </p>
      </div>

      <form
        method="get"
        className="mt-8 rounded-2xl border border-pacha-900/10 bg-white p-4 shadow-sm"
        aria-label="Filtros de la biblioteca"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
            <Label htmlFor="departamento">Departamento</Label>
            <Select
              id="departamento"
              name="departamento"
              defaultValue={params.departamento ?? ""}
            >
              <option value="">Todos</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
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
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm">
            <Filter className="h-3.5 w-3.5" aria-hidden />
            Aplicar filtros
          </Button>
          {hasFilters && (
            <Link
              href="/biblioteca"
              className="text-xs font-bold text-pacha-800 underline underline-offset-2"
            >
              Limpiar filtros
            </Link>
          )}
          <p className="ml-auto text-xs text-ink/45">
            {contents.length}{" "}
            {contents.length === 1 ? "contenido encontrado" : "contenidos encontrados"}
          </p>
        </div>
      </form>

      {contents.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              href={`/biblioteca/${content.slug}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={<BookOpen className="h-5 w-5" />}
          title="No encontramos contenidos con esos filtros"
          description="Prueba con otro cultivo, departamento o tipo de contenido."
        />
      )}
    </div>
  );
}
