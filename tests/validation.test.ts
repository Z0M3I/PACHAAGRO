import { describe, expect, it } from "vitest";
import { signUpSchema, profileUpdateSchema } from "@/lib/validation/auth";
import { announcementSchema, contentSchema } from "@/features/admin/schemas";

const validSignup = {
  fullName: "María Quispe",
  email: "maria@example.bo",
  phone: "71234567",
  password: "Pacha2026",
  departmentId: "00000000-0000-4000-8000-000000000101",
  municipalityId: "00000000-0000-4000-8000-000000000201",
  cropIds: ["00000000-0000-4000-8000-000000000401"],
  whatsappConsent: "on",
  termsAccepted: "on",
};

describe("validación de registro", () => {
  it("acepta un registro completo con consentimiento", () => {
    const parsed = signUpSchema.safeParse(validSignup);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.whatsappConsent).toBe(true);
      expect(parsed.data.cropIds).toHaveLength(1);
    }
  });

  it("acepta el registro sin consentimiento de WhatsApp (opcional)", () => {
    const parsed = signUpSchema.safeParse({
      ...validSignup,
      whatsappConsent: undefined,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.whatsappConsent).toBe(false);
    }
  });

  it("rechaza teléfonos inválidos y contraseñas débiles", () => {
    const parsed = signUpSchema.safeParse({
      ...validSignup,
      phone: "123",
      password: "corta",
    });
    expect(parsed.success).toBe(false);
  });

  it("no exige consentimiento de WhatsApp al solo actualizar el perfil", () => {
    const parsed = profileUpdateSchema.safeParse({
      fullName: "María Quispe",
      phone: "+591 71234567",
      departmentId: "d1",
      municipalityId: "m1",
      cropIds: [],
    });
    expect(parsed.success).toBe(true);
  });
});

const baseAnnouncement = {
  title: "Aviso de prueba para la comunidad",
  summary: "Resumen suficientemente largo para la validación.",
  body: "Contenido suficientemente largo para pasar la validación mínima.",
  type: "announcement" as const,
  audienceScope: "national" as const,
  isPublished: "on",
};

describe("validación de publicaciones", () => {
  it("acepta un anuncio nacional", () => {
    expect(announcementSchema.safeParse(baseAnnouncement).success).toBe(true);
  });

  it("exige cultivo cuando el alcance es por cultivo", () => {
    const parsed = announcementSchema.safeParse({
      ...baseAnnouncement,
      audienceScope: "crop",
    });
    expect(parsed.success).toBe(false);
  });

  it("exige departamento, municipio y comunidad para alcance comunitario", () => {
    const parsed = announcementSchema.safeParse({
      ...baseAnnouncement,
      audienceScope: "community",
      departmentId: "dep",
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza fechas de vigencia inválidas sin lanzar excepciones", () => {
    const parsed = announcementSchema.safeParse({
      ...baseAnnouncement,
      expiresAt: "no-es-fecha",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("validación de contenido educativo", () => {
  it("exige una categoría y minutos de lectura válidos", () => {
    const parsed = contentSchema.safeParse({
      title: "Guía de prueba",
      summary: "Resumen de prueba suficientemente largo.",
      body: "Contenido de prueba suficientemente largo para la validación.",
      categoryId: "cat-1",
      contentType: "guide",
      readingMinutes: "0",
      isPublished: "on",
      coverImageUrl: "http://insecure.example.com/image.jpg",
    });
    expect(parsed.success).toBe(false);
  });

  it("acepta contenido válido con URL https opcional", () => {
    const parsed = contentSchema.safeParse({
      title: "Guía de prueba",
      summary: "Resumen de prueba suficientemente largo.",
      body: "Contenido de prueba suficientemente largo para la validación.",
      categoryId: "cat-1",
      contentType: "guide",
      readingMinutes: "4",
      isPublished: "on",
      coverImageUrl: "https://example.com/image.jpg",
      sourceNotes: "Material de orientación general.",
    });
    expect(parsed.success).toBe(true);
  });
});
