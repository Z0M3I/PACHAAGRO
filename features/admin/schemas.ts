import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => !value || !Number.isNaN(Date.parse(value)),
    "Fecha inválida.",
  )
  .transform((value) => (value ? new Date(value).toISOString() : null));

const requiredDate = z
  .string()
  .trim()
  .min(1, "Indique una fecha.")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Fecha inválida.")
  .transform((value) => new Date(value).toISOString());

const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

const httpsUrl = z
  .string()
  .trim()
  .url("Ingrese una URL válida.")
  .refine((value) => value.startsWith("https://"), "Use una URL https.");

export const announcementSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(4, "El título es demasiado corto.").max(200),
    summary: z.string().trim().min(10, "El resumen debe tener al menos 10 caracteres.").max(400),
    body: z.string().trim().min(20, "El contenido debe tener al menos 20 caracteres."),
    type: z.enum(["announcement", "communique", "weather", "meeting", "event"]),
    audienceScope: z.enum([
      "national",
      "department",
      "municipality",
      "community",
      "crop",
    ]),
    departmentId: optionalText,
    municipalityId: optionalText,
    communityId: optionalText,
    cropId: optionalText,
    expiresAt: optionalDate,
    isPublished: checkbox,
  })
  .superRefine((value, context) => {
    if (value.audienceScope === "department" && !value.departmentId) {
      context.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Seleccione el departamento de destino.",
      });
    }
    if (
      value.audienceScope === "municipality" &&
      (!value.departmentId || !value.municipalityId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["municipalityId"],
        message: "Seleccione departamento y municipio.",
      });
    }
    if (
      value.audienceScope === "community" &&
      (!value.departmentId || !value.municipalityId || !value.communityId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["communityId"],
        message: "Seleccione departamento, municipio y comunidad.",
      });
    }
    if (value.audienceScope === "crop" && !value.cropId) {
      context.addIssue({
        code: "custom",
        path: ["cropId"],
        message: "Seleccione el cultivo de destino.",
      });
    }
  });

export const meetingSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(4, "El título es demasiado corto.").max(200),
    description: z.string().trim().min(10, "Agregue una descripción."),
    startsAt: requiredDate,
    endsAt: optionalDate,
    location: z.string().trim().min(2, "Indique el lugar o 'En línea'.").max(240),
    isVirtual: checkbox,
    virtualUrl: optionalText,
    departmentId: optionalText,
    municipalityId: optionalText,
    communityId: optionalText,
    cropId: optionalText,
  })
  .superRefine((value, context) => {
    if (value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "La fecha de fin debe ser posterior al inicio.",
      });
    }
    if (value.isVirtual) {
      const result = httpsUrl.safeParse(value.virtualUrl ?? "");
      if (!result.success) {
        context.addIssue({
          code: "custom",
          path: ["virtualUrl"],
          message: "Una reunión virtual requiere un enlace https.",
        });
      }
    }
  });

export const weatherAlertSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(4, "El título es demasiado corto.").max(200),
    description: z.string().trim().min(10, "Agregue una descripción."),
    severity: z.enum(["info", "moderate", "severe", "extreme"]),
    source: z
      .string()
      .trim()
      .min(2, "Indique la fuente de la alerta.")
      .max(200),
    startsAt: requiredDate,
    endsAt: optionalDate,
    departmentId: optionalText,
    municipalityId: optionalText,
    communityId: optionalText,
    isActive: checkbox,
  })
  .superRefine((value, context) => {
    if (value.endsAt && new Date(value.endsAt) <= new Date(value.startsAt)) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "La fecha de fin debe ser posterior al inicio.",
      });
    }
    if (value.municipalityId && !value.departmentId) {
      context.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Seleccione el departamento del municipio.",
      });
    }
    if (value.communityId && !value.municipalityId) {
      context.addIssue({
        code: "custom",
        path: ["municipalityId"],
        message: "Seleccione el municipio de la comunidad.",
      });
    }
  });

export const contentSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(4, "El título es demasiado corto.").max(200),
  summary: z.string().trim().min(10, "El resumen es demasiado corto.").max(400),
  body: z.string().trim().min(20, "El contenido es demasiado corto."),
  categoryId: z.string().trim().min(1, "Seleccione una categoría."),
  cropId: optionalText,
  departmentId: optionalText,
  contentType: z.enum([
    "guide",
    "crop_info",
    "care",
    "calendar",
    "pest",
    "disease",
    "good_practice",
    "soil",
  ]),
  readingMinutes: z.coerce
    .number()
    .int()
    .min(1, "Mínimo 1 minuto.")
    .max(60, "Máximo 60 minutos."),
  coverImageUrl: optionalText.refine(
    (value) => value === null || value.startsWith("https://"),
    "Use una URL https o deje vacío.",
  ),
  sourceNotes: optionalText,
  isPublished: checkbox,
});

export const notifySchema = z.object({
  kind: z.enum(["announcement", "weather_alert", "meeting", "educational"]),
  id: z.string().trim().min(1),
});

export const roleSchema = z.object({
  profileId: z.string().trim().min(1),
  role: z.enum(["admin", "producer", "association_manager", "content_editor"]),
});
