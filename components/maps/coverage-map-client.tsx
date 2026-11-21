"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { Department } from "@/types/domain";

export interface CoverageMapClientProps {
  departments: Department[];
  height?: number;
}

export default function CoverageMapClient({
  departments,
  height = 430,
}: CoverageMapClientProps) {
  return (
    <MapContainer
      center={[-17.2, -64.6]}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height, width: "100%", borderRadius: "1.25rem" }}
      aria-label="Mapa de cobertura nacional de PACHAAGRO"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {departments.map((department) => (
        <CircleMarker
          key={department.id}
          center={[department.latitude, department.longitude]}
          radius={10}
          pathOptions={{
            color: "#145A32",
            fillColor: "#E8B949",
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {department.name}
          </Tooltip>
          <Popup>
            <strong>PACHAAGRO · {department.name}</strong>
            <br />
            Comunicados, cultivos y contenidos disponibles para este
            departamento.
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
