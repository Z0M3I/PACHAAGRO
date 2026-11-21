"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { saveAlertAction } from "@/features/admin/actions";
import { initialActionState } from "@/types/actions";
import type {
  AlertSeverity,
  Community,
  Department,
  Municipality,
  WeatherAlert,
} from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { SEVERITY_LABELS } from "@/lib/labels";
import { toDateTimeLocal } from "@/lib/utils";

const severities = Object.entries(SEVERITY_LABELS) as [AlertSeverity, string][];

export function AlertForm({
  initial,
  departments,
  municipalities,
  communities,
}: {
  initial?: WeatherAlert;
  departments: Department[];
  municipalities: Municipality[];
  communities: Community[];
}) {
  const [state, formAction] = useActionState(
    saveAlertAction,
    initialActionState,
  );
  const [departmentId, setDepartmentId] = useState(initial?.departmentId ?? "");
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
      {state.status === "error" && <Alert tone="error">{state.message}</Alert>}
      <Alert tone="warning">
        No invente alertas. Registre solo información verificada e indique la
        fuente y vigencia. Las alertas de demostración deben quedar marcadas
        como DEMO.
      </Alert>

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
            className="min-h-24"
            required
          />
        </Field>
        <Field label="Severidad" htmlFor="severity" required>
          <Select
            id="severity"
            name="severity"
            defaultValue={initial?.severity ?? "info"}
          >
            {severities.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Fuente"
          htmlFor="source"
          required
          error={errors.source}
          hint="Ej. SENAMHI, Defensa Civil, centro de alertas de la asociación."
        >
          <Input
            id="source"
            name="source"
            defaultValue={initial?.source}
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
        <Field label="Departamento (opcional)" htmlFor="departmentId" error={errors.departmentId}>
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
        <Field label="Municipio (opcional)" htmlFor="municipalityId" error={errors.municipalityId}>
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
        <Field label="Comunidad (opcional)" htmlFor="communityId" error={errors.communityId}>
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
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink/70">
            <Checkbox name="isActive" defaultChecked={initial?.isActive ?? true} />
            <span>
              <strong className="text-pacha-950">Alerta activa</strong>
              <span className="block text-xs text-ink/45">
                Visible públicamente mientras esté vigente.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-pacha-900/8 pt-4">
        <SubmitButton>
          <ShieldAlert className="h-4 w-4" aria-hidden />
          {initial ? "Guardar cambios" : "Crear alerta"}
        </SubmitButton>
        <Link
          href="/admin/alertas"
          className="text-xs font-bold text-ink/50 hover:text-ink/80"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
