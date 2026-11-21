import { NextResponse, type NextRequest } from "next/server";
import { weatherQuerySchema } from "@/lib/validation/weather";
import {
  getWeatherForLocation,
  getWeatherForMunicipality,
} from "@/services/weather";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Límite simple en memoria para evitar abuso del endpoint público.
const rate = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rate.get(key);
  if (!entry || entry.resetAt < now) {
    rate.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas consultas. Intente en un minuto." },
      { status: 429 },
    );
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = weatherQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Parámetros inválidos." },
      { status: 400 },
    );
  }

  const { municipalityId, lat, lon, name } = parsed.data;

  const result = municipalityId
    ? await getWeatherForMunicipality(municipalityId)
    : lat !== undefined && lon !== undefined
      ? await getWeatherForLocation({
          name: name ?? "Ubicación consultada",
          departmentName: null,
          latitude: lat,
          longitude: lon,
          timezone: "America/La_Paz",
        })
      : null;

  if (!result) {
    return NextResponse.json(
      {
        ok: false,
        error: "Indique municipalityId o las coordenadas lat y lon.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
