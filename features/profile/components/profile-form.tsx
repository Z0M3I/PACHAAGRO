"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { Leaf, Save } from "lucide-react";
import { updateProfileAction } from "@/features/profile/actions";
import { initialActionState } from "@/types/actions";
import type {
  Community,
  Crop,
  Department,
  Municipality,
  SessionUser,
} from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

export function ProfileForm({
  user,
  departments,
  municipalities,
  communities,
  crops,
}: {
  user: SessionUser;
  departments: Department[];
  municipalities: Municipality[];
  communities: Community[];
  crops: Crop[];
}) {
  const [state, formAction] = useActionState(
    updateProfileAction,
    initialActionState,
  );
  const [departmentId, setDepartmentId] = useState(user.departmentId ?? "");
  const [municipalityId, setMunicipalityId] = useState(
    user.municipalityId ?? "",
  );
  const [communityId, setCommunityId] = useState(user.communityId ?? "");
  const [selectedCrops, setSelectedCrops] = useState<string[]>(user.cropIds);
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

  const toggleCrop = (id: string) => {
    setSelectedCrops((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "success" && <Alert tone="success">{state.message}</Alert>}
      {state.status === "error" && <Alert tone="error">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre completo"
          htmlFor="fullName"
          required
          error={errors.fullName}
          className="sm:col-span-2"
        >
          <Input
            id="fullName"
            name="fullName"
            defaultValue={user.fullName}
            autoComplete="name"
            required
          />
        </Field>
        <Field
          label="Teléfono / WhatsApp"
          htmlFor="phone"
          required
          error={errors.phone}
          hint="Formato boliviano, con o sin +591."
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone ?? ""}
            autoComplete="tel"
            required
          />
        </Field>
        <Field label="Correo" htmlFor="email-readonly">
          <Input
            id="email-readonly"
            value={user.email ?? "Sin correo registrado"}
            readOnly
            disabled
          />
        </Field>
        <Field
          label="Departamento"
          htmlFor="departmentId"
          required
          error={errors.departmentId}
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
        <Field
          label="Municipio"
          htmlFor="municipalityId"
          required
          error={errors.municipalityId}
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
        <Field
          label="Comunidad (opcional)"
          htmlFor="communityId"
          error={errors.communityId}
          className="sm:col-span-2"
        >
          <Select
            id="communityId"
            name="communityId"
            value={communityId}
            onChange={(event) => setCommunityId(event.target.value)}
            disabled={!municipalityId}
          >
            <option value="">Sin comunidad específica</option>
            {filteredCommunities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div>
        <p className="field-label">Cultivos de interés</p>
        <p className="field-help">
          Se usan para filtrar anuncios, contenidos y alertas por cultivo.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {crops.map((crop) => {
            const selected = selectedCrops.includes(crop.id);
            return (
              <label
                key={crop.id}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  selected
                    ? "border-pacha-700 bg-pacha-800 text-white"
                    : "border-pacha-900/15 bg-white text-ink/65 hover:border-pacha-600",
                )}
              >
                <input
                  type="checkbox"
                  name="cropIds"
                  value={crop.id}
                  checked={selected}
                  onChange={() => toggleCrop(crop.id)}
                  className="sr-only"
                />
                <Leaf className="h-3 w-3" aria-hidden />
                {crop.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-pacha-900/8 pt-4">
        <SubmitButton pendingText="Guardando perfil…">
          <Save className="h-4 w-4" aria-hidden />
          Guardar cambios
        </SubmitButton>
      </div>
    </form>
  );
}
