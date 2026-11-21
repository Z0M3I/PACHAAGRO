import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";
import { describeWeatherCode } from "@/services/weather/conditions";
import type {
  WeatherLocation,
  WeatherResult,
  WeatherSnapshot,
} from "@/types/domain";

/**
 * Contrato normalizado para una fuente oficial boliviana (por ejemplo un
 * servicio de SENAMHI habilitado para la organización). No se inventa un
 * endpoint: el administrador debe configurar SENAMHI_API_URL y el servicio
 * debe devolver este contrato.
 *
 * GET {SENAMHI_API_URL}?lat=-16.5&lon=-68.15
 * Authorization: Bearer {SENAMHI_API_KEY}
 */
const officialSchema = z.object({
  source: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    official: z.boolean().default(true),
  }),
  timezone: z.string().default("America/La_Paz"),
  updated_at: z.string().optional(),
  current: z.object({
    temperature_c: z.number(),
    apparent_temperature_c: z.number().nullable().optional(),
    humidity: z.number().nullable().optional(),
    precipitation_mm: z.number().nullable().optional(),
    wind_kmh: z.number().nullable().optional(),
    weather_code: z.number(),
  }),
  daily: z
    .array(
      z.object({
        date: z.string(),
        temp_min_c: z.number(),
        temp_max_c: z.number(),
        precipitation_mm: z.number().default(0),
        precipitation_probability: z.number().nullable().optional(),
        weather_code: z.number(),
      }),
    )
    .max(14),
});

export async function fetchOfficialWeather(
  location: WeatherLocation,
): Promise<WeatherResult> {
  if (!env.weather.officialUrl) {
    return {
      ok: false,
      data: null,
      error: "La fuente meteorológica oficial no está configurada.",
      sourceAttempted: "official",
    };
  }

  const url = new URL(env.weather.officialUrl);
  url.searchParams.set("lat", String(location.latitude));
  url.searchParams.set("lon", String(location.longitude));

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(10_000),
      headers: {
        Accept: "application/json",
        ...(env.weather.officialKey
          ? { Authorization: `Bearer ${env.weather.officialKey}` }
          : {}),
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        data: null,
        error: `La fuente oficial respondió con estado ${response.status}.`,
        sourceAttempted: "official",
      };
    }

    const parsed = officialSchema.safeParse(await response.json());
    if (!parsed.success) {
      return {
        ok: false,
        data: null,
        error: "La fuente oficial devolvió un formato no reconocido.",
        sourceAttempted: "official",
      };
    }

    const raw = parsed.data;
    const snapshot: WeatherSnapshot = {
      location,
      current: {
        temperatureC: raw.current.temperature_c,
        apparentTemperatureC: raw.current.apparent_temperature_c ?? null,
        humidity: raw.current.humidity ?? null,
        precipitationMm: raw.current.precipitation_mm ?? null,
        windKmh: raw.current.wind_kmh ?? null,
        weatherCode: raw.current.weather_code,
        condition: describeWeatherCode(raw.current.weather_code),
      },
      daily: raw.daily.map((day) => ({
        date: day.date,
        tempMinC: day.temp_min_c,
        tempMaxC: day.temp_max_c,
        precipitationMm: day.precipitation_mm,
        precipitationProbability: day.precipitation_probability ?? null,
        weatherCode: day.weather_code,
        condition: describeWeatherCode(day.weather_code),
      })),
      fetchedAt: raw.updated_at ?? new Date().toISOString(),
      sourceId: "official",
      sourceName: raw.source.name,
      sourceUrl: raw.source.url,
      isOfficial: raw.source.official,
      timezone: raw.timezone,
    };

    return {
      ok: true,
      data: snapshot,
      error: null,
      sourceAttempted: "official",
    };
  } catch {
    return {
      ok: false,
      data: null,
      error: "No se pudo conectar con la fuente meteorológica oficial.",
      sourceAttempted: "official",
    };
  }
}
