import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Sprout, Users } from "lucide-react";
import {
  getCommunities,
  getCrops,
  getDepartments,
  getMunicipalities,
} from "@/services/reference";
import { CoverageMap } from "@/components/maps/coverage-map";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cobertura nacional",
  description:
    "PACHAAGRO organiza información agrícola por departamento, municipio y comunidad en toda Bolivia.",
};

export default async function CoveragePage() {
  const [departments, municipalities, communities, crops] = await Promise.all([
    getDepartments(),
    getMunicipalities(),
    getCommunities(),
    getCrops(),
  ]);

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
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Cobertura nacional
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold sm:text-4xl">
          Nueve departamentos. Una misma forma de informar.
        </h1>
        <p className="mt-3 text-pretty text-base leading-relaxed text-ink/60">
          El contenido se organiza por departamento, municipio, comunidad y tipo
          de cultivo. La cobertura digital es nacional; la disponibilidad de
          alertas depende de las fuentes oficiales y de la información
          registrada por cada comunidad.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { value: departments.length, label: "departamentos", icon: MapPin },
          { value: municipalities.length, label: "municipios iniciales", icon: Building2 },
          { value: communities.length, label: "comunidades iniciales", icon: Users },
          { value: crops.length, label: "cultivos priorizados", icon: Sprout },
        ].map((item) => (
          <div
            key={item.label}
            className="surface flex items-center gap-3 p-4"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-pacha-100 text-pacha-800">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold leading-none">
                {item.value}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink/45">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-pacha-900/10 bg-white p-1.5 shadow-card">
        <CoverageMap departments={departments} height={480} />
      </div>
      <p className="mt-2 text-right text-[10px] text-ink/40">
        Mapa: colaboradores de OpenStreetMap. Los puntos son referencias
        departamentales, no límites oficiales.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => {
          const departmentMunicipalities = municipalities.filter(
            (item) => item.departmentId === department.id,
          );
          const municipalityIds = new Set(
            departmentMunicipalities.map((item) => item.id),
          );
          const departmentCommunities = communities.filter((item) =>
            municipalityIds.has(item.municipalityId),
          );
          return (
            <div
              key={department.id}
              className="rounded-2xl border border-pacha-900/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  {department.name}
                </h2>
                <span className="rounded-md bg-pacha-100 px-1.5 py-0.5 text-[10px] font-bold text-pacha-800">
                  {department.code}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink/55">
                {departmentMunicipalities.length} municipios ·{" "}
                {departmentCommunities.length} comunidades cargadas
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-ink/40">
                Comunicados, alertas y contenidos filtrables para este
                departamento.
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-pacha-900 px-6 py-7 text-white sm:px-8">
        <div>
          <p className="font-display text-xl font-semibold">
            ¿Tu comunidad todavía no aparece?
          </p>
          <p className="mt-1 text-sm text-pacha-100/65">
            El administrador puede incorporar municipios y comunidades desde la
            base de datos. Escríbenos al canal oficial.
          </p>
        </div>
        <ButtonLink href="/registro" variant="gold">
          Crear mi cuenta
        </ButtonLink>
      </div>
    </div>
  );
}
