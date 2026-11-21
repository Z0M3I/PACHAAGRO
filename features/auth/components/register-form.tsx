"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  UserPlus,
} from "lucide-react";
import { signUpAction } from "@/lib/auth/actions";
import { initialActionState } from "@/types/actions";
import type { Community, Crop, Department, Municipality } from "@/types/domain";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  departments: Department[];
  municipalities: Municipality[];
  communities: Community[];
  crops: Crop[];
  demoMode: boolean;
}

export function RegisterForm({
  departments,
  municipalities,
  communities,
  crops,
  demoMode,
}: RegisterFormProps) {
  const [state, formAction] = useActionState(signUpAction, initialActionState);
  const [departmentId, setDepartmentId] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

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

  const errors = state.fieldErrors ?? {};

  const toggleCrop = (cropId: string) => {
    setSelectedCrops((current) =>
      current.includes(cropId)
        ? current.filter((item) => item !== cropId)
        : [...current, cropId],
    );
  };

  return (
    <div>
      <p className="eyebrow">Registro de productor</p>
      <h1 className="mt-4 text-balance font-display text-3xl font-semibold sm:text-4xl">
        Crea tu cuenta en PACHAAGRO.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        Solo necesitamos lo esencial para enviarte información pertinente a tu
        zona y tus cultivos.
      </p>

      {demoMode && (
        <Alert tone="warning" className="mt-5" title="Registro en modo demostración">
          La cuenta se crea en la memoria del servidor local. No se envía ningún
          correo real y los datos se pierden al reiniciar. Para persistencia real,
          configura Supabase.
        </Alert>
      )}
      {state.status === "error" && (
        <Alert tone="error" className="mt-5">
          {state.message}
        </Alert>
      )}
      {state.status === "success" && (
        <Alert tone="success" className="mt-5">
          {state.message}
        </Alert>
      )}

      <form action={formAction} className="mt-6 space-y-6">
        <section aria-labelledby="datos-personales">
          <h2
            id="datos-personales"
            className="flex items-center gap-2 text-sm font-bold text-pacha-950"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-pacha-100 text-[11px] text-pacha-800">
              1
            </span>
            Datos personales
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                autoComplete="name"
                placeholder="Ej. María Quispe Mamani"
                required
              />
            </Field>
            <Field
              label="Correo electrónico"
              htmlFor="email"
              required
              error={errors.email}
            >
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="tucorreo@ejemplo.bo"
                required
              />
            </Field>
            <Field
              label="Teléfono / WhatsApp"
              htmlFor="phone"
              required
              error={errors.phone}
              hint="Formato boliviano: 71234567 o +591 71234567."
            >
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="71234567"
                required
              />
            </Field>
            <Field
              label="Contraseña"
              htmlFor="password"
              required
              error={errors.password}
              hint="Mínimo 8 caracteres, con letras y números."
              className="sm:col-span-2"
            >
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center text-ink/40 hover:text-ink/70"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </Field>
          </div>
        </section>

        <section aria-labelledby="ubicacion">
          <h2
            id="ubicacion"
            className="flex items-center gap-2 text-sm font-bold text-pacha-950"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-pacha-100 text-[11px] text-pacha-800">
              2
            </span>
            Tu ubicación
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
                onChange={(event) => setMunicipalityId(event.target.value)}
                disabled={!departmentId}
                required
              >
                <option value="">
                  {departmentId ? "Selecciona…" : "Primero elige departamento"}
                </option>
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
              hint="Si tu comunidad no aparece, puedes dejar el campo vacío."
              className="sm:col-span-2"
            >
              <Select
                id="communityId"
                name="communityId"
                disabled={!municipalityId}
              >
                <option value="">
                  {municipalityId
                    ? "Selecciona si aplica…"
                    : "Primero elige municipio"}
                </option>
                {filteredCommunities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <section aria-labelledby="cultivos">
          <h2
            id="cultivos"
            className="flex items-center gap-2 text-sm font-bold text-pacha-950"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-pacha-100 text-[11px] text-pacha-800">
              3
            </span>
            Cultivos de interés
          </h2>
          <p className="mt-1 text-xs text-ink/50">
            Elige hasta 12 cultivos. Puedes cambiarlos después.
          </p>
          {errors.cropIds && (
            <p className="field-error" role="alert">
              {errors.cropIds[0]}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
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
        </section>

        <section aria-labelledby="consentimiento">
          <h2
            id="consentimiento"
            className="flex items-center gap-2 text-sm font-bold text-pacha-950"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-pacha-100 text-[11px] text-pacha-800">
              4
            </span>
            Notificaciones y consentimiento
          </h2>
          <div className="mt-3 space-y-3 rounded-2xl border border-pacha-900/10 bg-white p-4">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-ink/70">
              <Checkbox name="whatsappConsent" />
              <span>
                <strong className="text-pacha-950">
                  Quiero recibir mensajes de WhatsApp (opcional)
                </strong>{" "}
                de PACHAAGRO sobre alertas, reuniones, anuncios y contenido
                educativo. Entiendo que puedo responder <strong>BAJA</strong>{" "}
                para dejar de recibirlos.
              </span>
            </label>
            {errors.whatsappConsent && (
              <p className="field-error" role="alert">
                {errors.whatsappConsent[0]}
              </p>
            )}
            <label className="flex cursor-pointer items-start gap-2.5 border-t border-pacha-900/8 pt-3 text-sm leading-relaxed text-ink/70">
              <Checkbox name="termsAccepted" />
              <span>
                Acepto los términos de uso y el tratamiento de mis datos según
                la{" "}
                <Link
                  href="/privacidad"
                  className="font-bold text-pacha-800 underline underline-offset-2"
                >
                  política de privacidad
                </Link>
                .
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="field-error" role="alert">
                {errors.termsAccepted[0]}
              </p>
            )}
            <p className="flex items-start gap-1.5 border-t border-pacha-900/8 pt-3 text-[11px] leading-relaxed text-ink/45">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pacha-600" aria-hidden />
              No compartimos tus datos con terceros ajenos a la operación de la
              plataforma. Puedes desactivar las notificaciones en cualquier
              momento.
            </p>
          </div>
        </section>

        <SubmitButton className="w-full" size="lg" pendingText="Creando cuenta…">
          <UserPlus className="h-4 w-4" aria-hidden />
          Crear mi cuenta
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-bold text-pacha-800 underline underline-offset-2"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
