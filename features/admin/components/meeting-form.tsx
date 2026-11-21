"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { saveMeetingAction } from "@/features/admin/actions";
import { initialActionState } from "@/types/actions";
import type {
  Community,
  Crop,
  Department,
  Meeting,
  Municipality,
} from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { toDateTimeLocal } from "@/lib/utils";

export function MeetingForm({
  initial,
  departments,
  municipalities,
  communities,
  crops,
}: {
  initial?: Meeting;
  departments: Department[];
  municipalities: Municipality[];
  communities: Community[];
  crops: Crop[];
}) {
  const [state, formAction] = useActionState(
    saveMeetingAction,
    initialActionState,
  );
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
  const [municipalityId, setMunicipalityId] = useState(
    initial?.municipalityId ?? "",
  );
  const [communityId, setCommunityId] = useState(initial?.communityId ?? "");
  const [isVirtual, setIsVirtual] = useState(initial?.isVirtual ?? false);
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
      {state.status === "error" && <Alert tone="error">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Título"
          htmlFor="title"
          required
          error={errors.title}
          className="sm:col-span-2"
        >
          <Input id="title" name="title" defaultValue={initial?.title} required />
        </Field>
        <Field
          label="Descripción"
          htmlFor="description"
          required
          error={errors.description}
          className="sm:col-span-2"
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={initial?.description}
            className="min-h-28"
            required
          />
        </Field>
        <Field label="Inicio" htmlFor="startsAt" required error={errors.startsAt}>
          <Input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initial?.startsAt)}
            required
          />
        </Field>
        <Field label="Fin (opcional)" htmlFor="endsAt" error={errors.endsAt}>
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocal(initial?.endsAt)}
          />
        </Field>
        <Field label="Lugar" htmlFor="location" required error={errors.location}>
          <Input
            id="location"
            name="location"
            defaultValue={initial?.location}
            placeholder="Casa comunal, plaza, en línea…"
            required
          />
        </Field>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/70">
            <Checkbox
              name="isVirtual"
              checked={isVirtual}
              onChange={(event) => setIsVirtual(event.target.checked)}
            />
            <span>
              <strong className="text-pacha-950">Reunión virtual</strong>
              <span className="block text-xs text-ink/45">
                Requiere enlace https.
              </span>
            </span>
          </label>
        </div>
        {isVirtual && (
          <Field
            label="Enlace de la reunión"
            htmlFor="virtualUrl"
            required
            error={errors.virtualUrl}
            className="sm:col-span-2"
          >
            <Input
              id="virtualUrl"
              name="virtualUrl"
              type="url"
              defaultValue={initial?.virtualUrl ?? ""}
              placeholder="https://…"
              required
            />
          </Field>
        )}
        <Field label="Departamento (opcional)" htmlFor="departmentId">
          <Select
            id="departmentId"
            name="departmentId"
            value={departmentId}
            onChange={(event) => {
              setDepartmentId(event.target.value);
              setMunicipalityId("");
              setCommunityId("");
            }}
          >
            <option value="">Toda Bolivia</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Municipio (opcional)" htmlFor="municipalityId">
          <Select
            id="municipalityId"
            name="municipalityId"
            value={municipalityId}
            onChange={(event) => {
              setMunicipalityId(event.target.value);
              setCommunityId("");
            }}
            disabled={!departmentId}
          >
            <option value="">Todos</option>
            {filteredMunicipalities.map((municipality) => (
              <option key={municipality.id} value={municipality.id}>
                {municipality.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Comunidad (opcional)" htmlFor="communityId">
          <Select
            id="communityId"
            name="communityId"
            value={communityId}
            onChange={(event) => setCommunityId(event.target.value)}
            disabled={!municipalityId}
          >
            <option value="">Todas</option>
            {filteredCommunities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cultivo (opcional)" htmlFor="cropId">
          <Select id="cropId" name="cropId" defaultValue={initial?.cropId ?? ""}>
            <option value="">Transversal</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-pacha-900/8 pt-4">
        <SubmitButton>
          <CalendarDays className="h-4 w-4" aria-hidden />
          {initial ? "Guardar cambios" : "Crear reunión"}
        </SubmitButton>
        <Link
          href="/admin/reuniones"
          className="text-xs font-bold text-ink/50 hover:text-ink/80"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
