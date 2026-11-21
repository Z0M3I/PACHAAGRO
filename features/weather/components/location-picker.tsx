"use client";

import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import type { Department, Municipality } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form";

export function WeatherLocationPicker({
  departments,
  municipalities,
  selectedMunicipalityId,
}: {
  departments: Department[];
  municipalities: Municipality[];
  selectedMunicipalityId?: string;
}) {
  const selected = municipalities.find(
    (item) => item.id === selectedMunicipalityId,
  );
  const [departmentId, setDepartmentId] = useState(selected?.departmentId ?? "");
  const [municipalityId, setMunicipalityId] = useState(
    selectedMunicipalityId ?? "",
  );

  const filtered = useMemo(
    () =>
      municipalities.filter(
        (item) => !departmentId || item.departmentId === departmentId,
      ),
    [municipalities, departmentId],
  );

  return (
    <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="departamento">Departamento</Label>
        <Select
          id="departamento"
          value={departmentId}
          onChange={(event) => {
            setDepartmentId(event.target.value);
            setMunicipalityId("");
          }}
        >
          <option value="">Todos</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex-1">
        <Label htmlFor="municipio">Municipio</Label>
        <Select
          id="municipio"
          name="municipio"
          value={municipalityId}
          onChange={(event) => setMunicipalityId(event.target.value)}
          disabled={!departmentId}
          required
        >
          <option value="">
            {departmentId ? "Selecciona un municipio" : "Elige departamento"}
          </option>
          {filtered.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={!municipalityId} className="sm:mb-0">
        <Search className="h-4 w-4" aria-hidden />
        Consultar
      </Button>
      <p className="flex items-center gap-1 text-[10px] text-ink/40 sm:hidden">
        <MapPin className="h-3 w-3" aria-hidden />
        Datos con fuente identificada
      </p>
    </form>
  );
}
