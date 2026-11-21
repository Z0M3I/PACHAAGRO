import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWeatherForLocation } from "@/services/weather";
import { sendTextMessage } from "@/services/whatsapp/meta-client";
import {
  recordInboundMessage,
  recordOutboundMessage,
  isMessageProcessed,
  updateMessageStatus,
} from "@/services/whatsapp/messages";
import {
  helpMessage,
  interpretWhatsAppCommand,
} from "@/services/whatsapp/commands";
import type { WebhookMessage, WebhookPayload } from "@/lib/validation/whatsapp";
import type { WeatherLocation } from "@/types/domain";
import { formatDateTime, normalizePhone } from "@/lib/utils";

interface ProfileRow {
  id: string;
  full_name: string;
  phone: string | null;
  department_id: string | null;
  municipality_id: string | null;
  community_id: string | null;
  role: string;
}

function extractText(message: WebhookMessage): string {
  return (
    message.text?.body ??
    message.button?.text ??
    message.interactive?.button_reply?.title ??
    message.interactive?.list_reply?.title ??
    ""
  );
}

async function findProfile(
  phone: string,
): Promise<ProfileRow | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const normalized = normalizePhone(phone);
  const { data } = await admin
    .from("profiles")
    .select("*")
    .in("phone", [normalized, `+${normalized}`])
    .limit(1)
    .maybeSingle();
  return (data as unknown as ProfileRow | null) ?? null;
}

async function findMunicipalityByName(
  query: string,
): Promise<{
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  department_id: string;
} | null> {
  if (query.trim().length < 3) return null;
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("municipalities")
    .select("id, name, latitude, longitude, department_id")
    .ilike("name", `%${query.trim()}%`)
    .limit(1);
  const rows = (data ?? []) as unknown as {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    department_id: string;
  }[];
  return rows[0] ?? null;
}

async function getMunicipalityById(id: string): Promise<{
  name: string;
  latitude: number | null;
  longitude: number | null;
  department_id: string;
} | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("municipalities")
    .select("name, latitude, longitude, department_id")
    .eq("id", id)
    .limit(1)
    .maybeSingle();
  return (
    (data as unknown as {
      name: string;
      latitude: number | null;
      longitude: number | null;
      department_id: string;
    } | null) ?? null
  );
}

async function getDepartmentName(id: string | null): Promise<string | null> {
  if (!id) return null;
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("departments")
    .select("name")
    .eq("id", id)
    .limit(1)
    .maybeSingle();
  return (data as unknown as { name: string } | null)?.name ?? null;
}

async function buildWeatherReply(
  profile: ProfileRow | null,
  argument: string,
): Promise<string> {
  let municipality:
    | {
        name: string;
        latitude: number | null;
        longitude: number | null;
        department_id: string;
      }
    | null = null;

  if (argument) {
    municipality = await findMunicipalityByName(argument);
    if (!municipality) {
      return `No encontré el municipio "${argument}". Prueba con el nombre exacto, por ejemplo: CLIMA Punata.`;
    }
  } else if (profile?.municipality_id) {
    municipality = await getMunicipalityById(profile.municipality_id);
  }

  if (!municipality) {
    return "Para consultar el clima, envía el nombre de tu municipio. Ejemplo: CLIMA Cochabamba.";
  }
  if (municipality.latitude === null || municipality.longitude === null) {
    return "No tenemos coordenadas registradas para ese municipio. Consulta en la plataforma web.";
  }

  const location: WeatherLocation = {
    name: municipality.name,
    departmentName: await getDepartmentName(municipality.department_id),
    latitude: municipality.latitude,
    longitude: municipality.longitude,
    timezone: "America/La_Paz",
  };

  const forecast = await getWeatherForLocation(location);
  if (!forecast.ok || !forecast.data) {
    return "No hay información meteorológica actualizada disponible en este momento. No mostramos datos estimados.";
  }

  const weather = forecast.data;
  const today = weather.daily[0];
  return [
    `Clima en ${weather.location.name}${weather.location.departmentName ? ` (${weather.location.departmentName})` : ""}`,
    `Ahora: ${Math.round(weather.current.temperatureC)} °C · ${weather.current.condition}`,
    today
      ? `Hoy: mín ${Math.round(today.tempMinC)} °C / máx ${Math.round(today.tempMaxC)} °C · lluvia ${today.precipitationMm} mm`
      : null,
    `Actualizado: ${formatDateTime(weather.fetchedAt)}`,
    `Fuente: ${weather.sourceName}${weather.isOfficial ? " (oficial)" : " (no oficial)"}`,
    "No reemplaza los avisos de las autoridades bolivianas.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function buildAlertsReply(profile: ProfileRow | null): Promise<string> {
  const admin = createSupabaseAdminClient();
  if (!admin) return "El servicio de alertas no está disponible.";
  const { data } = await admin
    .from("weather_alerts")
    .select("title, description, severity, department_id, municipality_id, is_demo, starts_at, ends_at")
    .eq("is_active", true)
    .limit(50);

  const rows = (data ?? []) as unknown as {
    title: string;
    description: string;
    severity: string;
    department_id: string | null;
    municipality_id: string | null;
    is_demo: boolean;
    starts_at: string;
    ends_at: string | null;
  }[];

  const relevant = rows.filter((row) => {
    if (!row.department_id) return true;
    if (!profile) return false;
    if (row.department_id !== profile.department_id) return false;
    if (row.municipality_id && row.municipality_id !== profile.municipality_id) {
      return false;
    }
    return true;
  });

  if (relevant.length === 0) {
    return "No hay alertas activas registradas para tu zona en este momento. Esto no reemplaza los avisos oficiales.";
  }

  return [
    "Alertas activas:",
    ...relevant.slice(0, 4).map(
      (row) =>
        `${row.is_demo ? "[DEMO] " : ""}${row.title} (${row.severity})\n${row.description.slice(0, 220)}`,
    ),
    "",
    "Consulta el detalle en la plataforma.",
  ].join("\n");
}

async function buildCropsReply(profile: ProfileRow | null): Promise<string> {
  if (!profile) {
    return "No encontramos tu número registrado. Crea tu cuenta en la plataforma para asociar tus cultivos.";
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return "El servicio no está disponible.";
  const { data } = await admin
    .from("user_crops")
    .select("crops(name)")
    .eq("profile_id", profile.id)
    .limit(20);
  const rows = (data ?? []) as unknown as {
    crops: { name: string } | { name: string }[] | null;
  }[];
  const names = rows
    .map((row) => (Array.isArray(row.crops) ? row.crops[0]?.name : row.crops?.name))
    .filter(Boolean);
  if (names.length === 0) {
    return "Aún no registraste cultivos de interés. Puedes actualizarlos en tu perfil de la plataforma.";
  }
  return `Tus cultivos registrados: ${names.join(", ")}.\nPuedes actualizarlos en tu perfil de PACHAAGRO.`;
}

async function buildContentReply(): Promise<string> {
  const admin = createSupabaseAdminClient();
  if (!admin) return "La biblioteca no está disponible.";
  const { data } = await admin
    .from("educational_contents")
    .select("title, summary, slug, is_demo")
    .eq("is_published", true)
    .order("updated_at", { ascending: false })
    .limit(3);
  const rows = (data ?? []) as unknown as {
    title: string;
    summary: string;
    slug: string;
    is_demo: boolean;
  }[];
  if (rows.length === 0) return "Todavía no hay contenidos educativos publicados.";
  return [
    "Contenidos educativos recientes:",
    ...rows.map(
      (row) => `${row.is_demo ? "[DEMO] " : ""}${row.title}\n${row.summary.slice(0, 140)}`,
    ),
    "",
    "Lee las guías completas en la biblioteca de PACHAAGRO.",
  ].join("\n");
}

async function setOptIn(
  profileId: string,
  optIn: boolean,
): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;
  const now = new Date().toISOString();
  const { error } = await admin.from("notification_preferences").upsert(
    {
      profile_id: profileId,
      whatsapp_opt_in: optIn,
      consent_at: optIn ? now : null,
      updated_at: now,
    },
    { onConflict: "profile_id" },
  );
  return !error;
}

async function handleMessage(message: WebhookMessage): Promise<void> {
  if (await isMessageProcessed(message.id)) return;

  const phone = normalizePhone(message.from);
  const text = extractText(message);
  const profile = await findProfile(phone);

  await recordInboundMessage({
    profileId: profile?.id ?? null,
    phone,
    waMessageId: message.id,
    body: text,
    messageType: message.type,
  });

  const command = interpretWhatsAppCommand(text);
  let reply = "";

  switch (command.kind) {
    case "weather":
      reply = await buildWeatherReply(profile, command.argument);
      break;
    case "alerts":
      reply = await buildAlertsReply(profile);
      break;
    case "crops":
      reply = await buildCropsReply(profile);
      break;
    case "content":
      reply = await buildContentReply();
      break;
    case "opt_in": {
      if (!profile) {
        reply =
          "No encontramos tu número registrado. Crea tu cuenta en PACHAAGRO y acepta recibir mensajes para activar las notificaciones.";
        break;
      }
      const ok = await setOptIn(profile.id, true);
      reply = ok
        ? "Listo. Activaste las notificaciones de PACHAAGRO. Puedes responder BAJA cuando quieras para desactivarlas."
        : "No pudimos activar las notificaciones. Intenta más tarde.";
      break;
    }
    case "opt_out": {
      if (!profile) {
        reply = "No encontramos tu número registrado. No recibirás mensajes de la plataforma.";
        break;
      }
      const ok = await setOptIn(profile.id, false);
      reply = ok
        ? "Listo. Desactivaste las notificaciones. No volverás a recibir mensajes proactivos. Puedes escribir ALTA para reactivarlas."
        : "No pudimos actualizar tu preferencia. Intenta más tarde.";
      break;
    }
    case "help":
    case "unknown":
    default:
      reply = helpMessage();
      break;
  }

  const result = await sendTextMessage({ to: phone, body: reply });
  await recordOutboundMessage(
    {
      profileId: profile?.id ?? null,
      phone,
      body: reply,
      templateName: null,
      messageType: "text",
    },
    result,
  );
}

export interface WebhookProcessResult {
  messagesHandled: number;
  statusesHandled: number;
}

/**
 * Procesa el payload de WhatsApp Cloud API. La firma ya debe haber sido
 * verificada por el Route Handler.
 */
export async function processWhatsAppWebhook(
  payload: WebhookPayload,
): Promise<WebhookProcessResult> {
  let messagesHandled = 0;
  let statusesHandled = 0;

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;

      for (const message of change.value.messages ?? []) {
        try {
          await handleMessage(message);
          messagesHandled += 1;
        } catch {
          // No registramos cuerpos ni teléfonos en los logs del servidor.
          console.error("Error procesando mensaje de WhatsApp", message.id);
        }
      }

      for (const status of change.value.statuses ?? []) {
        try {
          const errorMessage = status.errors?.[0]?.message ?? null;
          await updateMessageStatus(status.id, status.status, errorMessage);
          statusesHandled += 1;
        } catch {
          console.error("Error actualizando estado de WhatsApp", status.id);
        }
      }
    }
  }

  return { messagesHandled, statusesHandled };
}
