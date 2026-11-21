import "server-only";
import { z } from "zod";
import { describeWeatherCode } from "@/services/weather/conditions";
import type {
  WeatherLocation,
  WeatherResult,
  WeatherSnapshot,
} from "@/types/domain";

const openMeteoSchema = z.object({
  timezone: z.string().optional(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    apparent_temperature: z.number().nullish(),
    relative_humidity_2m: z.number().nullish(),
    precipitation: z.number().nullish(),
    weather_code: z.number(),
    wind_speed_10m: z.number().nullish(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    precipitation_probability_max: z.array(z.number().nullable()).optional(),
  }),
});

export async function fetchOpenMeteo(
  location: WeatherLocation,
): Promise<WeatherResult> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "kmh",
  });

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      {
        next: { revalidate: 1800 },
        signal: AbortSignal.timeout(10_000),
        headers: {
          Accept: "application/json",
          "User-Agent": "PACHAAGRO/1.0 (+https://pachaagro.vercel.app)",
        },
      },
    );

    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 160);
      console.error(
        "[weather] Open-Meteo HTTP error:",
        response.status,
        response.headers.get("content-type"),
        detail,
      );
      return {
        ok: false,
        data: null,
        error: `Open-Meteo respondió con estado ${response.status}.`,
        sourceAttempted: "open-meteo",
      };
    }

    const rawBody = await response.text();
    let rawJson: unknown;
    try {
      rawJson = JSON.parse(rawBody);
    } catch {
      console.error(
        "[weather] Open-Meteo non-JSON response:",
        response.status,
        response.headers.get("content-type"),
        rawBody.slice(0, 160),
      );
      return {
        ok: false,
        data: null,
        error: "El servicio meteorológico devolvió una respuesta no válida.",
        sourceAttempted: "open-meteo",
      };
    }

    const parsed = openMeteoSchema.safeParse(rawJson);
    if (!parsed.success) {
      return {
        ok: false,
        data: null,
        error: "La respuesta de Open-Meteo no tiene el formato esperado.",
        sourceAttempted: "open-meteo",
      };
    }

    const raw = parsed.data;
    const daily = raw.daily.time.map((date, index) => ({
      date,
      tempMinC: raw.daily.temperature_2m_min[index] ?? 0,
      tempMaxC: raw.daily.temperature_2m_max[index] ?? 0,
      precipitationMm: raw.daily.precipitation_sum[index] ?? 0,
      precipitationProbability:
        raw.daily.precipitation_probability_max?.[index] ?? null,
      weatherCode: raw.daily.weather_code[index] ?? 0,
      condition: describeWeatherCode(raw.daily.weather_code[index] ?? 0),
    }));

    const snapshot: WeatherSnapshot = {
      location,
      current: {
        temperatureC: raw.current.temperature_2m,
        apparentTemperatureC: raw.current.apparent_temperature ?? null,
        humidity: raw.current.relative_humidity_2m ?? null,
        precipitationMm: raw.current.precipitation ?? null,
        windKmh: raw.current.wind_speed_10m ?? null,
        weatherCode: raw.current.weather_code,
        condition: describeWeatherCode(raw.current.weather_code),
      },
      daily,
      fetchedAt: new Date().toISOString(),
      sourceId: "open-meteo",
      sourceName: "Open-Meteo (modelo meteorológico global)",
      sourceUrl: "https://open-meteo.com/",
      isOfficial: false,
      timezone: raw.timezone ?? "America/La_Paz",
    };

    return {
      ok: true,
      data: snapshot,
      error: null,
      sourceAttempted: "open-meteo",
      notice:
        "Datos de un proveedor meteorológico internacional. No constituyen una alerta oficial boliviana.",
    };
  } catch (error) {
    if (error instanceof Error) {
      const cause = (error as Error & { cause?: unknown }).cause;
      console.error(
        "[weather] Open-Meteo fetch failed:",
        error.name,
        error.message,
        cause ? String(cause) : "",
      );
    }
    return {
      ok: false,
      data: null,
      error:
        error instanceof Error && error.name === "TimeoutError"
          ? "La consulta meteorológica excedió el tiempo de espera."
          : "No se pudo conectar con el servicio meteorológico.",
      sourceAttempted: "open-meteo",
    };
  }
}
