"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { requireUser } from "@/lib/auth/session";
import {
  changePasswordSchema,
  preferencesSchema,
  profileUpdateSchema,
} from "@/lib/validation/auth";
import { normalizePhone } from "@/lib/utils";
import {
  getCommunities,
  getMunicipalities,
} from "@/services/reference";
import {
  updatePreferences,
  updateProfile,
} from "@/services/profiles";
import {
  failure,
  success,
  type ActionState,
} from "@/types/actions";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser("/panel/perfil");
  const cropIds = formData.getAll("cropIds").map(String).filter(Boolean);
  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    departmentId: formData.get("departmentId"),
    municipalityId: formData.get("municipalityId"),
    communityId: formData.get("communityId") || undefined,
    cropIds,
  });

  if (!parsed.success) {
    return failure(
      "Revisa los datos del perfil.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  const municipalities = await getMunicipalities(data.departmentId);
  if (!municipalities.some((item) => item.id === data.municipalityId)) {
    return failure("El municipio no pertenece al departamento elegido.");
  }

  const communityId = data.communityId || null;
  if (communityId) {
    const communities = await getCommunities(data.municipalityId);
    if (!communities.some((item) => item.id === communityId)) {
      return failure("La comunidad no pertenece al municipio elegido.");
    }
  }

  const result = await updateProfile(user, {
    fullName: data.fullName,
    phone: normalizePhone(data.phone),
    departmentId: data.departmentId,
    municipalityId: data.municipalityId,
    communityId,
    cropIds: data.cropIds,
  });

  if (!result.ok) return failure(result.error ?? "No se pudo guardar el perfil.");

  revalidatePath("/panel/perfil");
  revalidatePath("/panel");
  return success("Perfil actualizado correctamente.");
}

export async function updatePreferencesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser("/panel/notificaciones");
  const parsed = preferencesSchema.safeParse({
    whatsappOptIn: formData.get("whatsappOptIn"),
    weatherAlerts: formData.get("weatherAlerts"),
    meetingNotices: formData.get("meetingNotices"),
    announcements: formData.get("announcements"),
    educationalContent: formData.get("educationalContent"),
    consent: formData.get("consent"),
  });

  if (!parsed.success) {
    return failure(
      "Revisa las preferencias.",
      parsed.error.flatten().fieldErrors,
    );
  }

  if (parsed.data.whatsappOptIn && !user.phone) {
    return failure(
      "Agrega un teléfono en tu perfil antes de activar WhatsApp.",
    );
  }

  const result = await updatePreferences(user.id, {
    whatsappOptIn: parsed.data.whatsappOptIn,
    weatherAlerts: parsed.data.weatherAlerts,
    meetingNotices: parsed.data.meetingNotices,
    announcements: parsed.data.announcements,
    educationalContent: parsed.data.educationalContent,
  });

  if (!result.ok) {
    return failure(result.error ?? "No se pudieron guardar las preferencias.");
  }

  revalidatePath("/panel/notificaciones");
  revalidatePath("/panel");
  return success(
    parsed.data.whatsappOptIn
      ? "Preferencias guardadas. El consentimiento de WhatsApp quedó registrado."
      : "Preferencias guardadas. Los mensajes proactivos de WhatsApp quedaron desactivados.",
  );
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export async function uploadAvatarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser("/panel/perfil");
  if (isDemoMode) {
    return failure(
      "La carga de archivos requiere Supabase Storage configurado. En modo demo no se sube ningún archivo.",
    );
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return failure("Selecciona una imagen.");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return failure("Formato no permitido. Usa JPG, PNG o WebP.");
  }
  if (file.size > MAX_SIZE) {
    return failure("La imagen supera los 2 MB.");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return failure("Supabase no está configurado.");

  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return failure("No se pudo subir la imagen. Revisa las políticas de Storage.");
  }

  const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl.publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return failure("La imagen se subió, pero no se pudo asociar al perfil.");
  }

  revalidatePath("/panel/perfil");
  revalidatePath("/panel");
  return success("Foto de perfil actualizada.");
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser("/panel/perfil");
  if (isDemoMode) {
    return failure(
      "El cambio de contraseña requiere Supabase Auth. En modo demo las cuentas usan una contraseña fija.",
    );
  }

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return failure(
      "Revisa la nueva contraseña.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return failure("Supabase no está configurado.");

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return failure("No se pudo cambiar la contraseña.");

  return success("Contraseña actualizada correctamente.");
}
