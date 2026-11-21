"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireRole } from "@/lib/auth/session";
import {
  canManageAnnouncements,
  canManageContent,
  isAdminRole,
} from "@/lib/auth/permissions";
import { createAnnouncement, deleteAnnouncement, getAnnouncementById, updateAnnouncement } from "@/services/announcements";
import {
  createContent,
  deleteContent,
  getContentById,
  updateContent,
} from "@/services/education";
import {
  createMeeting,
  deleteMeeting,
  getMeetingById,
  updateMeeting,
} from "@/services/meetings";
import {
  createWeatherAlert,
  deleteWeatherAlert,
  getWeatherAlertById,
  toggleWeatherAlert,
  updateWeatherAlert,
} from "@/services/weather-alerts";
import {
  getCommunities,
  getMunicipalities,
} from "@/services/reference";
import { updateUserRole } from "@/services/profiles";
import { dispatchNotification, dispatchUrl } from "@/services/whatsapp/dispatch";
import {
  announcementSchema,
  contentSchema,
  meetingSchema,
  notifySchema,
  roleSchema,
  weatherAlertSchema,
} from "@/features/admin/schemas";
import {
  failure,
  success,
  type ActionState,
} from "@/types/actions";

async function validateHierarchy(
  departmentId: string | null,
  municipalityId: string | null,
  communityId: string | null,
): Promise<string | null> {
  if (municipalityId) {
    if (!departmentId) return "Seleccione el departamento.";
    const municipalities = await getMunicipalities(departmentId);
    if (!municipalities.some((item) => item.id === municipalityId)) {
      return "El municipio no pertenece al departamento.";
    }
  }
  if (communityId) {
    if (!municipalityId) return "Seleccione el municipio de la comunidad.";
    const communities = await getCommunities(municipalityId);
    if (!communities.some((item) => item.id === communityId)) {
      return "La comunidad no pertenece al municipio.";
    }
  }
  return null;
}

export async function saveAnnouncementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["admin", "content_editor"], "/admin/publicaciones");
  if (!canManageAnnouncements(user.role)) {
    return failure("No tienes permisos para gestionar publicaciones.");
  }

  const parsed = announcementSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    summary: formData.get("summary"),
    body: formData.get("body"),
    type: formData.get("type"),
    audienceScope: formData.get("audienceScope"),
    departmentId: formData.get("departmentId") || undefined,
    municipalityId: formData.get("municipalityId") || undefined,
    communityId: formData.get("communityId") || undefined,
    cropId: formData.get("cropId") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
    isPublished: formData.get("isPublished"),
  });

  if (!parsed.success) {
    return failure(
      "Revisa los datos de la publicación.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  const hierarchyError = await validateHierarchy(
    data.departmentId,
    data.municipalityId,
    data.communityId,
  );
  if (hierarchyError) return failure(hierarchyError);

  const input = {
    title: data.title,
    summary: data.summary,
    body: data.body,
    type: data.type,
    audienceScope: data.audienceScope,
    departmentId: data.departmentId,
    municipalityId: data.municipalityId,
    communityId: data.communityId,
    cropId: data.cropId,
    isPublished: data.isPublished,
    expiresAt: data.expiresAt,
  };

  const result = data.id
    ? await updateAnnouncement(data.id, input)
    : await createAnnouncement(input, user);

  if (!result.ok) return failure(result.error ?? "No se pudo guardar.");

  revalidatePath("/admin/publicaciones");
  revalidatePath("/panel/anuncios");
  revalidatePath("/alertas");
  redirect(`/admin/publicaciones?ok=${data.id ? "actualizado" : "creado"}`);
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  const user = await requireRole(["admin", "content_editor"], "/admin/publicaciones");
  if (!canManageAnnouncements(user.role)) return;
  await deleteAnnouncement(id);
  revalidatePath("/admin/publicaciones");
  revalidatePath("/panel/anuncios");
}

export async function saveMeetingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("/admin/reuniones");
  const parsed = meetingSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
    location: formData.get("location"),
    isVirtual: formData.get("isVirtual"),
    virtualUrl: formData.get("virtualUrl") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    municipalityId: formData.get("municipalityId") || undefined,
    communityId: formData.get("communityId") || undefined,
    cropId: formData.get("cropId") || undefined,
  });

  if (!parsed.success) {
    return failure(
      "Revisa los datos de la reunión.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  const hierarchyError = await validateHierarchy(
    data.departmentId,
    data.municipalityId,
    data.communityId,
  );
  if (hierarchyError) return failure(hierarchyError);

  const input = {
    title: data.title,
    description: data.description,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    location: data.location,
    isVirtual: data.isVirtual,
    virtualUrl: data.virtualUrl,
    departmentId: data.departmentId,
    municipalityId: data.municipalityId,
    communityId: data.communityId,
    cropId: data.cropId,
  };

  const result = data.id
    ? await updateMeeting(data.id, input)
    : await createMeeting(input, user.id);
  if (!result.ok) return failure(result.error ?? "No se pudo guardar.");

  revalidatePath("/admin/reuniones");
  revalidatePath("/panel/reuniones");
  redirect(`/admin/reuniones?ok=${data.id ? "actualizado" : "creado"}`);
}

export async function deleteMeetingAction(id: string): Promise<void> {
  await requireAdmin("/admin/reuniones");
  await deleteMeeting(id);
  revalidatePath("/admin/reuniones");
}

export async function saveAlertAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin("/admin/alertas");
  const parsed = weatherAlertSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    severity: formData.get("severity"),
    source: formData.get("source"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    municipalityId: formData.get("municipalityId") || undefined,
    communityId: formData.get("communityId") || undefined,
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return failure(
      "Revisa los datos de la alerta.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  const hierarchyError = await validateHierarchy(
    data.departmentId,
    data.municipalityId,
    data.communityId,
  );
  if (hierarchyError) return failure(hierarchyError);

  const input = {
    title: data.title,
    description: data.description,
    severity: data.severity,
    source: data.source,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    departmentId: data.departmentId,
    municipalityId: data.municipalityId,
    communityId: data.communityId,
    isActive: data.isActive,
  };

  const result = data.id
    ? await updateWeatherAlert(data.id, input)
    : await createWeatherAlert(input, user.id);
  if (!result.ok) return failure(result.error ?? "No se pudo guardar.");

  revalidatePath("/admin/alertas");
  revalidatePath("/panel/clima");
  revalidatePath("/alertas");
  redirect(`/admin/alertas?ok=${data.id ? "actualizado" : "creado"}`);
}

export async function deleteAlertAction(id: string): Promise<void> {
  await requireAdmin("/admin/alertas");
  await deleteWeatherAlert(id);
  revalidatePath("/admin/alertas");
  revalidatePath("/alertas");
}

export async function toggleAlertAction(id: string): Promise<void> {
  await requireAdmin("/admin/alertas");
  const alert = await getWeatherAlertById(id);
  if (alert) await toggleWeatherAlert(id, !alert.isActive);
  revalidatePath("/admin/alertas");
  revalidatePath("/alertas");
}

export async function saveContentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole(["admin", "content_editor"], "/admin/biblioteca");
  if (!canManageContent(user.role)) {
    return failure("No tienes permisos para gestionar contenido.");
  }

  const parsed = contentSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    summary: formData.get("summary"),
    body: formData.get("body"),
    categoryId: formData.get("categoryId"),
    cropId: formData.get("cropId") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    contentType: formData.get("contentType"),
    readingMinutes: formData.get("readingMinutes"),
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    sourceNotes: formData.get("sourceNotes") || undefined,
    isPublished: formData.get("isPublished"),
  });

  if (!parsed.success) {
    return failure(
      "Revisa los datos del contenido.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  const input = {
    title: data.title,
    summary: data.summary,
    body: data.body,
    categoryId: data.categoryId,
    cropId: data.cropId,
    departmentId: data.departmentId,
    contentType: data.contentType,
    readingMinutes: data.readingMinutes,
    coverImageUrl: data.coverImageUrl,
    sourceNotes: data.sourceNotes,
    isPublished: data.isPublished,
  };

  const result = data.id
    ? await updateContent(data.id, input)
    : await createContent(input, user.id);
  if (!result.ok) return failure(result.error ?? "No se pudo guardar.");

  revalidatePath("/admin/biblioteca");
  revalidatePath("/panel/biblioteca");
  revalidatePath("/biblioteca");
  redirect(`/admin/biblioteca?ok=${data.id ? "actualizado" : "creado"}`);
}

export async function deleteContentAction(id: string): Promise<void> {
  const user = await requireRole(["admin", "content_editor"], "/admin/biblioteca");
  if (!canManageContent(user.role)) return;
  await deleteContent(id);
  revalidatePath("/admin/biblioteca");
  revalidatePath("/biblioteca");
}

export async function updateRoleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin("/admin/usuarios");
  const parsed = roleSchema.safeParse({
    profileId: formData.get("profileId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return failure("Datos de rol inválidos.");

  if (parsed.data.profileId === admin.id) {
    return failure("No puedes cambiar tu propio rol desde este panel.");
  }

  const result = await updateUserRole(parsed.data.profileId, parsed.data.role);
  if (!result.ok) return failure(result.error ?? "No se pudo actualizar el rol.");

  revalidatePath("/admin/usuarios");
  return success("Rol actualizado.");
}

export async function notifyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin("/admin/notificaciones");
  if (!isAdminRole(admin.role)) return failure("No autorizado.");

  const parsed = notifySchema.safeParse({
    kind: formData.get("kind"),
    id: formData.get("id"),
  });
  if (!parsed.success) return failure("Solicitud de notificación inválida.");

  const { kind, id } = parsed.data;

  if (kind === "announcement") {
    const announcement = await getAnnouncementById(id);
    if (!announcement) return failure("Publicación no encontrada.");
    const result = await dispatchNotification({
      kind: "announcement",
      referenceId: announcement.id,
      url: dispatchUrl({ kind: "announcement", id: announcement.id }),
      announcement,
    });
    return summarize(result);
  }

  if (kind === "weather_alert") {
    const alert = await getWeatherAlertById(id);
    if (!alert) return failure("Alerta no encontrada.");
    const result = await dispatchNotification({
      kind: "weather_alert",
      referenceId: alert.id,
      url: dispatchUrl({ kind: "weather_alert", id: alert.id }),
      alert,
    });
    return summarize(result);
  }

  if (kind === "meeting") {
    const meeting = await getMeetingById(id);
    if (!meeting) return failure("Reunión no encontrada.");
    const result = await dispatchNotification({
      kind: "meeting",
      referenceId: meeting.id,
      url: dispatchUrl({ kind: "meeting", id: meeting.id }),
      meeting,
    });
    return summarize(result);
  }

  const content = await getContentById(id);
  if (!content) return failure("Contenido no encontrado.");
  const result = await dispatchNotification({
    kind: "educational",
    referenceId: content.id,
    url: dispatchUrl({ kind: "educational", id: content.id, slug: content.slug }),
    content,
  });
  return summarize(result);
}

function summarize(result: {
  sent: number;
  simulated: number;
  failed: number;
  skipped: number;
  errors: string[];
}): ActionState {
  if (result.sent === 0 && result.simulated === 0 && result.failed === 0) {
    return success(
      "No hay destinatarios con consentimiento de WhatsApp que coincidan con el alcance. No se envió nada.",
    );
  }
  const parts = [
    `${result.sent} enviados`,
    `${result.simulated} simulados`,
    `${result.failed} fallidos`,
  ];
  return success(
    `Procesado: ${parts.join(", ")}. ${result.skipped} usuarios quedaron fuera por preferencias o alcance.${result.errors.length > 0 ? ` Errores: ${result.errors.join(" ")}` : ""}`,
  );
}
