"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Megaphone } from "lucide-react";
import { saveAnnouncementAction } from "@/features/admin/actions";
import { initialActionState } from "@/types/actions";
import type {
  Announcement,
  AnnouncementType,
  AudienceScope,
  Community,
  Crop,
  Department,
  Municipality,
} from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { ANNOUNCEMENT_TYPE_LABELS, AUDIENCE_LABELS } from "@/lib/labels";
import { toDateTimeLocal } from "@/lib/utils";

const types = Object.entries(ANNOUNCEMENT_TYPE_LABELS) as [
  AnnouncementType,
  string,
][];
const scopes = Object.entries(AUDIENCE_LABELS) as [AudienceScope, string][];

export function AnnouncementForm({
  initial,
  departments,
  municipalities,
  communities,
  crops,
}: {
  initial?: Announcement;
  departments: Department[];
  municipalities: Municipality[];
  communities: Community[];
  crops: Crop[];
}) {
  const [state, formAction] = useActionState(
    saveAnnouncementAction,
    initialActionState,
  );
  const [scope, setScope] = useState<AudienceScope>(
    initial?.audienceScope ?? "national",
  );
  const [departmentId, setDepartmentId] = useState(
    initial?.departmentId ?? "",
  );
  const [municipalityId, setMunicipalityId] = useState(
    initial?.municipalityId ?? "",
  );
  const [communityId, setCommunityId] = useState(initial?.communityId ?? "");
  const errors = state.fieldErrors ?? {};

  const filteredMunicipalities = useMemo(
    () =>
      municipalities.filter(
        (item) => !departmentId || item.departmentId === departmentId,
      ),
    [municipalities, departmentId],
  );
  const filteredCommunities = useMemo(
    () =>
      communities.filter(
        (item) => !municipalityId || item.municipalityId === municipalityId,
      ),
    [communities, municipalityId],
  );

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
            placeholder="Ej. Jornada de cuidado del suelo"
            required
          />
        </Field>
        <Field label="Tipo de publicación" htmlFor="type" required error={errors.type}>
          <Select id="type" name="type" defaultValue={initial?.type ?? "announcement"}>
            {types.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Alcance"
          htmlFor="audienceScope"
          required
          error={errors.audienceScope}
        >
          <Select
            id="audienceScope"
            name="audienceScope"
            value={scope}
            onChange={(event) => setScope(event.target.value as AudienceScope)}
          >
            {scopes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        {scope !== "national" && scope !== "crop" && (
          <Field
            label="Departamento"
            htmlFor="departmentId"
            error={errors.departmentId}
            required
          >
            <Select
              id="departmentId"
              name="departmentId"
              value={departmentId}
              onChange={(event) => {
                setDepartmentId(event.target.value);
                setMunicipalityId("");
                setCommunityId("");
              }}
              required
            >
              <option value="">Selecciona…</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {(scope === "municipality" || scope === "community") && (
          <Field
            label="Municipio"
            htmlFor="municipalityId"
            error={errors.municipalityId}
            required
          >
            <Select
              id="municipalityId"
              name="municipalityId"
              value={municipalityId}
              onChange={(event) => {
                setMunicipalityId(event.target.value);
                setCommunityId("");
              }}
              disabled={!departmentId}
              required
            >
              <option value="">Selecciona…</option>
              {filteredMunicipalities.map((municipality) => (
                <option key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {scope === "community" && (
          <Field
            label="Comunidad"
            htmlFor="communityId"
            error={errors.communityId}
            required
          >
            <Select
              id="communityId"
              name="communityId"
              value={communityId}
              onChange={(event) => setCommunityId(event.target.value)}
              disabled={!municipalityId}
              required
            >
              <option value="">Selecciona…</option>
              {filteredCommunities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {scope === "crop" && (
          <Field
            label="Cultivo"
            htmlFor="cropId"
            error={errors.cropId}
            required
          >
            <Select
              id="cropId"
              name="cropId"
              defaultValue={initial?.cropId ?? ""}
              required
            >
              <option value="">Selecciona…</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field
          label="Resumen"
          htmlFor="summary"
          required
          error={errors.summary}
          className="sm:col-span-2"
          hint="Máximo 400 caracteres. Aparece en las tarjetas y notificaciones."
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
          hint="Puedes usar ## para subtítulos y - para listas."
        >
          <Textarea
            id="body"
            name="body"
            defaultValue={initial?.body}
            className="min-h-64 font-mono text-[13px]"
            required
          />
        </Field>

        <Field
          label="Vigencia hasta (opcional)"
          htmlFor="expiresAt"
          error={errors.expiresAt}
          hint="Después de esta fecha dejará de mostrarse públicamente."
        >
          <Input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initial?.expiresAt)}
          />
        </Field>

        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/70">
            <Checkbox
              name="isPublished"
              defaultChecked={initial?.isPublished ?? true}
            />
            <span>
              <strong className="text-pacha-950">Publicar ahora</strong>
              <span className="block text-xs text-ink/45">
                Si se desactiva, queda como borrador.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-pacha-900/8 pt-4">
        <SubmitButton>
          <Megaphone className="h-4 w-4" aria-hidden />
          {initial ? "Guardar cambios" : "Crear publicación"}
        </SubmitButton>
        <Link
          href="/admin/publicaciones"
          className="text-xs font-bold text-ink/50 hover:text-ink/80"
        >
          Cancelar
        </Link>
        {state.status === "success" && (
          <span className="text-xs font-semibold text-pacha-700">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
