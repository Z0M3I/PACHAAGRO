"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/empty-state";
import type { Department } from "@/types/domain";

const CoverageMapClient = dynamic(
  () => import("@/components/maps/coverage-map-client"),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-[430px] w-full overflow-hidden rounded-[1.25rem] bg-pacha-100">
        <Skeleton className="absolute inset-0 rounded-none" />
        <p className="absolute inset-0 grid place-items-center text-sm font-semibold text-pacha-800">
          Cargando mapa de cobertura…
        </p>
      </div>
    ),
  },
);

export function CoverageMap({
  departments,
  height = 430,
}: {
  departments: Department[];
  height?: number;
}) {
  return <CoverageMapClient departments={departments} height={height} />;
}
