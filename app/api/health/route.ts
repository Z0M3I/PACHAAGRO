import { NextResponse } from "next/server";
import {
  isDemoMode,
  isSupabaseConfigured,
  isWhatsAppConfigured,
  isWhatsAppSimulation,
  isOfficialWeatherConfigured,
} from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Estado de configuración para verificación de despliegue. No expone
 * credenciales ni datos de usuarios.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "PACHAAGRO",
    timestamp: new Date().toISOString(),
    mode: isDemoMode ? "demo" : "supabase",
    integrations: {
      supabase: isSupabaseConfigured,
      whatsapp: isWhatsAppConfigured
        ? "configured"
        : isWhatsAppSimulation
          ? "simulation"
          : "disabled",
      officialWeather: isOfficialWeatherConfigured,
    },
  });
}
