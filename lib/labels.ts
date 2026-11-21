import type {
  AlertSeverity,
  AnnouncementType,
  AudienceScope,
  EducationalContentType,
} from "@/types/domain";

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  announcement: "Anuncio",
  communique: "Comunicado",
  weather: "Alerta climática",
  meeting: "Reunión",
  event: "Evento comunitario",
};

export const AUDIENCE_LABELS: Record<AudienceScope, string> = {
  national: "Toda Bolivia",
  department: "Departamento",
  municipality: "Municipio",
  community: "Comunidad",
  crop: "Por cultivo",
};

export const CONTENT_TYPE_LABELS: Record<EducationalContentType, string> = {
  guide: "Guía",
  crop_info: "Ficha de cultivo",
  care: "Cuidados",
  calendar: "Calendario",
  pest: "Plagas",
  disease: "Enfermedades",
  good_practice: "Buenas prácticas",
  soil: "Suelo",
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: "Informativa",
  moderate: "Moderada",
  severe: "Severa",
  extreme: "Extrema",
};

export const SEVERITY_TONE: Record<
  AlertSeverity,
  "green" | "gold" | "orange" | "red"
> = {
  info: "green",
  moderate: "gold",
  severe: "orange",
  extreme: "red",
};

export function locationLabel(input: {
  audienceScope?: AudienceScope;
  departmentName?: string | null;
  municipalityName?: string | null;
  communityName?: string | null;
  cropName?: string | null;
}): string {
  if (input.communityName) return input.communityName;
  if (input.municipalityName) return input.municipalityName;
  if (input.departmentName) return input.departmentName;
  if (input.cropName) return `Cultivo: ${input.cropName}`;
  return "Toda Bolivia";
}
