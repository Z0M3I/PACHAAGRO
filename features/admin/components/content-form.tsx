"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { saveContentAction } from "@/features/admin/actions";
import { initialActionState } from "@/types/actions";
import type {
  ContentCategory,
  Crop,
  Department,
  EducationalContent,
  EducationalContentType,
} from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { CONTENT_TYPE_LABELS } from "@/lib/labels";

const types = Object.entries(CONTENT_TYPE_LABELS) as [
  EducationalContentType,
  string,
][];

export function ContentForm({
  initial,
  categories,
  crops,
  departments,
}: {
  initial?: EducationalContent;
  categories: ContentCategory[];
  crops: Crop[];
  departments: Department[];
}) {
  const [state, formAction] = useActionState(
    saveContentAction,
    initialActionState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {state.status === "error" && (
        <Alert tone="error">{state.message}</Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Título"
          htmlFor="title"
          required
          error={errors.title}
          className="sm:col-span-2"
        >
          <Input
            id="title"
            name="title"
            defaultValue={initial?.title}
            maxLength={200}
            required
          />
        </Field>
        <Field label="Tipo de contenido" htmlFor="contentType" required error={errors.contentType}>
          <Select
            id="contentType"
            name="contentType"
            defaultValue={initial?.contentType ?? "guide"}
          >
            {types.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Categoría" htmlFor="categoryId" required error={errors.categoryId}>
          <Select
            id="categoryId"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            required
          >
            <option value="">Selecciona…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cultivo (opcional)" htmlFor="cropId" error={errors.cropId}>
          <Select id="cropId" name="cropId" defaultValue={initial?.cropId ?? ""}>
            <option value="">Transversal</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Departamento (opcional)"
          htmlFor="departmentId"
          error={errors.departmentId}
        >
          <Select
            id="departmentId"
            name="departmentId"
            defaultValue={initial?.departmentId ?? ""}
          >
            <option value="">Aplicable a Bolivia</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Resumen"
          htmlFor="summary"
          required
          error={errors.summary}
          className="sm:col-span-2"
        >
          <Textarea
            id="summary"
            name="summary"
            defaultValue={initial?.summary}
            maxLength={400}
            className="min-h-20"
            required
          />
        </Field>
        <Field
          label="Contenido"
          htmlFor="body"
          required
          error={errors.body}
          className="sm:col-span-2"
          hint="Usa ## para subtítulos y - para listas."
        >
          <Textarea
            id="body"
            name="body"
            defaultValue={initial?.body}
            className="min-h-72 font-mono text-[13px]"
            required
          />
        </Field>
        <Field
          label="Minutos de lectura"
          htmlFor="readingMinutes"
          required
          error={errors.readingMinutes}
        >
          <Input
            id="readingMinutes"
            name="readingMinutes"
            type="number"
            min={1}
            max={60}
            defaultValue={initial?.readingMinutes ?? 4}
            required
          />
        </Field>
        <Field
          label="Imagen de portada (URL https)"
          htmlFor="coverImageUrl"
          error={errors.coverImageUrl}
          hint="Opcional. Puede alojarse en Supabase Storage."
        >
          <Input
            id="coverImageUrl"
            name="coverImageUrl"
            type="url"
            defaultValue={initial?.coverImageUrl ?? ""}
            placeholder="https://…"
          />
        </Field>
        <Field
          label="Nota de fuente y alcance"
          htmlFor="sourceNotes"
          error={errors.sourceNotes}
          className="sm:col-span-2"
          hint="Obligatoria para no presentar recomendaciones generales como instrucciones oficiales."
        >
          <Textarea
            id="sourceNotes"
            name="sourceNotes"
            defaultValue={initial?.sourceNotes ?? ""}
            className="min-h-20"
            placeholder="Ej. Material de orientación general. Validar con un técnico local."
          />
        </Field>
        <div className="flex items-end pb-2 sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/70">
            <Checkbox
              name="isPublished"
              defaultChecked={initial?.isPublished ?? true}
            />
            <span>
              <strong className="text-pacha-950">Publicar en la biblioteca</strong>
              <span className="block text-xs text-ink/45">
                Si se desactiva, queda como borrador.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-pacha-900/8 pt-4">
        <SubmitButton>
          <BookOpen className="h-4 w-4" aria-hidden />
          {initial ? "Guardar cambios" : "Crear contenido"}
        </SubmitButton>
        <Link
          href="/admin/biblioteca"
          className="text-xs font-bold text-ink/50 hover:text-ink/80"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
