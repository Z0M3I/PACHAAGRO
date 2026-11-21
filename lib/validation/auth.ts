import { z } from "zod";

const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingrese su correo electrónico.")
    .email("Ingrese un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  next: z.string().trim().optional(),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Ingrese su nombre completo.")
    .max(120, "El nombre es demasiado largo."),
  email: z.string().trim().email("Ingrese un correo válido."),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+?591)?[\s-]?[0-9]{7,8}$/,
      "Ingrese un teléfono boliviano válido (7 u 8 dígitos).",
    ),
  password: z
    .string()
    .min(8, "Use al menos 8 caracteres.")
    .regex(/[A-Za-z]/, "Incluya al menos una letra.")
    .regex(/[0-9]/, "Incluya al menos un número."),
  departmentId: z.string().min(1, "Seleccione un departamento."),
  municipalityId: z.string().min(1, "Seleccione un municipio."),
  communityId: z.string().trim().optional(),
  cropIds: z.array(z.string()).max(12, "Seleccione hasta 12 cultivos."),
  whatsappConsent: z.preprocess(
    (value) => value === "on" || value === "true" || value === true,
    z.boolean(),
  ),
  termsAccepted: z
    .preprocess(
      (value) => value === "on" || value === "true" || value === true,
      z.boolean(),
    )
    .refine((value) => value, "Debe aceptar los términos de uso."),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(3, "Ingrese su nombre completo.").max(120),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+?591)?[\s-]?[0-9]{7,8}$/,
      "Ingrese un teléfono boliviano válido.",
    ),
  departmentId: z.string().min(1, "Seleccione un departamento."),
  municipalityId: z.string().min(1, "Seleccione un municipio."),
  communityId: z.string().trim().optional(),
  cropIds: z.array(z.string()).max(12),
});

export const preferencesSchema = z
  .object({
    whatsappOptIn: checkbox,
    weatherAlerts: checkbox,
    meetingNotices: checkbox,
    announcements: checkbox,
    educationalContent: checkbox,
    consent: checkbox,
  })
  .superRefine((value, context) => {
    if (value.whatsappOptIn && !value.consent) {
      context.addIssue({
        code: "custom",
        path: ["consent"],
        message:
          "Confirma el consentimiento para recibir mensajes de WhatsApp.",
      });
    }
  });

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use al menos 8 caracteres.")
      .regex(/[A-Za-z]/, "Incluya al menos una letra.")
      .regex(/[0-9]/, "Incluya al menos un número."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
