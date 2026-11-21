import "server-only";
import { env, isOfficialWeatherConfigured } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { fetchOpenMeteo } from "@/services/weather/open-meteo";
import { fetchOfficialWeather } from "@/services/weather/official";
import type { WeatherLocation, WeatherResult } from "@/types/domain";

function providerOrder(): ("official" | "open-meteo")[] {
  if (!isOfficialWeatherConfigured) return ["open-meteo"];
  if (env.weather.primaryProvider === "open-meteo") return ["open-meteo"];
  return ["official", "open-meteo"];
}

export async function getWeatherForLocation(
  location: WeatherLocation,
): Promise<WeatherResult> {
  const errors: string[] = [];
  for (const provider of providerOrder()) {
    const result =
      provider === "official"
        ? await fetchOfficialWeather(location)
        : await fetchOpenMeteo(location);

    if (result.ok && result.data) {
      if (errors.length > 0) {
        return {
          ...result,
          notice: `${errors.join(" ")} Se muestra el respaldo de Open-Meteo; no es una fuente oficial.`,
        };
      }
      return result;
    }
    if (result.error) errors.push(result.error);
  }

  return {
    ok: false,
    data: null,
    error:
      "No hay información meteorológica disponible en este momento. No se muestran datos estimados.",
    sourceAttempted: providerOrder().join(" → "),
    notice: errors.join(" "),
  };
}

export async function getWeatherLocationByMunicipality(
  municipalityId: string,
): Promise<WeatherLocation | null> {
  if (isDemoMode) {
    const store = getDemoStore();
    const municipality = store.municipalities.find(
      (item) => item.id === municipalityId,
    );
    if (!municipality) return null;
    const department = store.departments.find(
      (item) => item.id === municipality.departmentId,
    );
    return {
      name: municipality.name,
      departmentName: department?.name ?? null,
      latitude: municipality.latitude,
      longitude: municipality.longitude,
      timezone: "America/La_Paz",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("municipalities")
    .select("name, latitude, longitude, departments(name)")
    .eq("id", municipalityId)
    .maybeSingle();

  if (!data) return null;
  const row = data as unknown as {
    name: string;
    latitude: number | null;
    longitude: number | null;
    departments: { name: string } | { name: string }[] | null;
  };
  if (row.latitude === null || row.longitude === null) return null;
  const department = Array.isArray(row.departments)
    ? row.departments[0]?.name
    : row.departments?.name;

  return {
    name: row.name,
    departmentName: department ?? null,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: "America/La_Paz",
  };
}

export async function getWeatherForMunicipality(
  municipalityId: string,
): Promise<WeatherResult> {
  const location = await getWeatherLocationByMunicipality(municipalityId);
  if (!location) {
    return {
      ok: false,
      data: null,
      error: "No se encontró la ubicación seleccionada.",
      sourceAttempted: null,
    };
  }
  return getWeatherForLocation(location);
}
