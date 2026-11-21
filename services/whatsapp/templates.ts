import { env } from "@/lib/env";
import { formatDateTime } from "@/lib/utils";

export type WhatsAppTemplateKind =
  | "weather_alert"
  | "meeting"
  | "announcement"
  | "education";

export interface TemplatePayload {
  templateName: string;
  parameters: string[];
  preview: string;
}

const reminder = "Responde BAJA para no recibir más mensajes.";

export function buildAlertTemplate(input: {
  title: string;
  description: string;
  location: string;
  validity: string;
  url: string;
}): TemplatePayload {
  return {
    templateName: env.whatsapp.templates.alert,
    parameters: [
      input.title,
      input.description,
      input.location,
      input.validity,
      `${input.url}\n${reminder}`,
    ],
    preview: `PACHAAGRO · Alerta\n${input.title}\n${input.description}\nZona: ${input.location}\nVigencia: ${input.validity}\n${input.url}\n${reminder}`,
  };
}

export function buildMeetingTemplate(input: {
  title: string;
  startsAt: string;
  location: string;
  description: string;
  url: string;
}): TemplatePayload {
  return {
    templateName: env.whatsapp.templates.meeting,
    parameters: [
      input.title,
      formatDateTime(input.startsAt),
      input.location,
      `${input.description}\n${input.url}\n${reminder}`,
    ],
    preview: `PACHAAGRO · Reunión\n${input.title}\nFecha: ${formatDateTime(input.startsAt)}\nLugar: ${input.location}\n${input.description}\n${input.url}\n${reminder}`,
  };
}

export function buildAnnouncementTemplate(input: {
  title: string;
  summary: string;
  url: string;
}): TemplatePayload {
  return {
    templateName: env.whatsapp.templates.announcement,
    parameters: [input.title, input.summary, `${input.url}\n${reminder}`],
    preview: `PACHAAGRO · Anuncio\n${input.title}\n${input.summary}\n${input.url}\n${reminder}`,
  };
}

export function buildEducationTemplate(input: {
  title: string;
  summary: string;
  url: string;
}): TemplatePayload {
  return {
    templateName: env.whatsapp.templates.education,
    parameters: [input.title, input.summary, `${input.url}\n${reminder}`],
    preview: `PACHAAGRO · Contenido educativo\n${input.title}\n${input.summary}\n${input.url}\n${reminder}`,
  };
}

export const TEMPLATE_CONTRACTS = [
  {
    kind: "alerta_climatica",
    name: env.whatsapp.templates.alert,
    body: "PACHAAGRO · Alerta\n{{1}}\n{{2}}\nZona: {{3}}\nVigencia: {{4}}\n{{5}}",
    parameters: ["título", "descripción", "zona", "vigencia", "enlace + BAJA"],
  },
  {
    kind: "reunion_comunitaria",
    name: env.whatsapp.templates.meeting,
    body: "PACHAAGRO · Reunión\n{{1}}\nFecha: {{2}}\nLugar: {{3}}\n{{4}}",
    parameters: ["título", "fecha", "lugar", "descripción + enlace"],
  },
  {
    kind: "anuncio_agricola",
    name: env.whatsapp.templates.announcement,
    body: "PACHAAGRO · Anuncio\n{{1}}\n{{2}}\n{{3}}",
    parameters: ["título", "resumen", "enlace + BAJA"],
  },
  {
    kind: "contenido_educativo",
    name: env.whatsapp.templates.education,
    body: "PACHAAGRO · Contenido educativo\n{{1}}\n{{2}}\n{{3}}",
    parameters: ["título", "resumen", "enlace"],
  },
] as const;
