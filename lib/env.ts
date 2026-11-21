import "server-only";

const optional = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const supabaseUrl = optional(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = optional(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * La aplicación solo opera en modo Supabase cuando ambas variables públicas
 * están presentes. En caso contrario se habilita el modo demostración,
 * que usa datos en memoria y sesiones de demostración.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isDemoMode = !isSupabaseConfigured;

export const env = {
  appUrl: optional(process.env.NEXT_PUBLIC_APP_URL) ?? "http://localhost:3000",
  siteName: optional(process.env.NEXT_PUBLIC_SITE_NAME) ?? "PACHAAGRO",
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey: optional(process.env.SUPABASE_SERVICE_ROLE_KEY),
  whatsapp: {
    accessToken: optional(process.env.WHATSAPP_ACCESS_TOKEN),
    phoneNumberId: optional(process.env.WHATSAPP_PHONE_NUMBER_ID),
    businessAccountId: optional(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
    verifyToken: optional(process.env.WHATSAPP_VERIFY_TOKEN),
    appSecret: optional(process.env.WHATSAPP_APP_SECRET),
    apiVersion: optional(process.env.WHATSAPP_API_VERSION) ?? "v23.0",
    templateLanguage:
      optional(process.env.WHATSAPP_TEMPLATE_LANGUAGE) ?? "es",
    demoMode: process.env.WHATSAPP_DEMO_MODE !== "false",
    templates: {
      alert:
        optional(process.env.WHATSAPP_TEMPLATE_ALERT) ??
        "alerta_climatica_pachaagro",
      meeting:
        optional(process.env.WHATSAPP_TEMPLATE_MEETING) ??
        "reunion_comunitaria_pachaagro",
      announcement:
        optional(process.env.WHATSAPP_TEMPLATE_ANNOUNCEMENT) ??
        "anuncio_agricola_pachaagro",
      education:
        optional(process.env.WHATSAPP_TEMPLATE_EDUCATION) ??
        "contenido_educativo_pachaagro",
    },
  },
  weather: {
    officialUrl: optional(process.env.SENAMHI_API_URL),
    officialKey: optional(process.env.SENAMHI_API_KEY),
    primaryProvider: optional(process.env.WEATHER_PRIMARY_PROVIDER) ?? "auto",
  },
} as const;

export const isWhatsAppConfigured = Boolean(
  env.whatsapp.accessToken && env.whatsapp.phoneNumberId,
);

export const isWhatsAppWebhookConfigured = Boolean(
  env.whatsapp.verifyToken && env.whatsapp.appSecret,
);

/**
 * Solo se simula cuando faltan credenciales y el modo demo está habilitado.
 * Si hay credenciales, nunca se simula silenciosamente.
 */
export const isWhatsAppSimulation =
  !isWhatsAppConfigured && env.whatsapp.demoMode;

export const isOfficialWeatherConfigured = Boolean(env.weather.officialUrl);
