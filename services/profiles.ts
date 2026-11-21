import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import type {
  NotificationPreference,
  Profile,
  SessionUser,
} from "@/types/domain";
import type { ProfileUpdateInput } from "@/types/inputs";
import { mapProfile, type ProfileRow } from "@/services/mappers";

export async function getProfileById(id: string): Promise<Profile | null> {
  if (isDemoMode) {
    return getDemoStore().profiles.find((item) => item.id === id) ?? null;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapProfile(data as unknown as ProfileRow) : null;
}

export async function listProfiles(): Promise<Profile[]> {
  if (isDemoMode) {
    return [...getDemoStore().profiles].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as ProfileRow[]).map(mapProfile);
}

export async function getUserCrops(profileId: string): Promise<string[]> {
  if (isDemoMode) return getDemoStore().userCrops[profileId] ?? [];
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("user_crops")
    .select("crop_id")
    .eq("profile_id", profileId);
  return ((data ?? []) as unknown as { crop_id: string }[]).map(
    (row) => row.crop_id,
  );
}

export async function updateProfile(
  user: SessionUser,
  input: ProfileUpdateInput,
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    const index = store.profiles.findIndex((item) => item.id === user.id);
    if (index < 0) return { ok: false, error: "Perfil no encontrado." };
    store.profiles[index] = {
      ...store.profiles[index]!,
      fullName: input.fullName,
      phone: input.phone,
      departmentId: input.departmentId,
      municipalityId: input.municipalityId,
      communityId: input.communityId,
      updatedAt: now,
    };
    store.userCrops[user.id] = input.cropIds;
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      department_id: input.departmentId,
      municipality_id: input.municipalityId,
      community_id: input.communityId,
      updated_at: now,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: "No se pudo actualizar el perfil." };

  const { error: deleteError } = await supabase
    .from("user_crops")
    .delete()
    .eq("profile_id", user.id);
  if (deleteError) {
    return { ok: false, error: "No se pudieron actualizar los cultivos." };
  }
  if (input.cropIds.length > 0) {
    const { error: insertError } = await supabase.from("user_crops").insert(
      input.cropIds.map((cropId) => ({
        profile_id: user.id,
        crop_id: cropId,
      })),
    );
    if (insertError) {
      return { ok: false, error: "No se pudieron guardar los cultivos." };
    }
  }
  return { ok: true };
}

export async function updateUserRole(
  profileId: string,
  role: Profile["role"],
): Promise<{ ok: boolean; error?: string }> {
  if (isDemoMode) {
    const profile = getDemoStore().profiles.find((item) => item.id === profileId);
    if (!profile) return { ok: false, error: "Usuario no encontrado." };
    profile.role = role;
    profile.updatedAt = new Date().toISOString();
    return { ok: true };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId);
  return error
    ? { ok: false, error: "No se pudo actualizar el rol." }
    : { ok: true };
}

function defaultPreference(profileId: string): NotificationPreference {
  return {
    profileId,
    whatsappOptIn: false,
    weatherAlerts: true,
    meetingNotices: true,
    announcements: true,
    educationalContent: false,
    consentAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getPreferences(
  profileId: string,
): Promise<NotificationPreference> {
  if (isDemoMode) {
    return (
      getDemoStore().preferences.find((item) => item.profileId === profileId) ??
      defaultPreference(profileId)
    );
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultPreference(profileId);
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!data) return defaultPreference(profileId);
  const row = data as unknown as {
    profile_id: string;
    whatsapp_opt_in: boolean;
    weather_alerts: boolean;
    meeting_notices: boolean;
    announcements: boolean;
    educational_content: boolean;
    consent_at: string | null;
    updated_at: string;
  };
  return {
    profileId: row.profile_id,
    whatsappOptIn: row.whatsapp_opt_in,
    weatherAlerts: row.weather_alerts,
    meetingNotices: row.meeting_notices,
    announcements: row.announcements,
    educationalContent: row.educational_content,
    consentAt: row.consent_at,
    updatedAt: row.updated_at,
  };
}

export async function updatePreferences(
  profileId: string,
  values: {
    whatsappOptIn: boolean;
    weatherAlerts: boolean;
    meetingNotices: boolean;
    announcements: boolean;
    educationalContent: boolean;
  },
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    const index = store.preferences.findIndex(
      (item) => item.profileId === profileId,
    );
    const preference: NotificationPreference = {
      profileId,
      ...values,
      consentAt: values.whatsappOptIn
        ? (index >= 0
            ? store.preferences[index]!.consentAt
            : now) ?? now
        : null,
      updatedAt: now,
    };
    if (index >= 0) store.preferences[index] = preference;
    else store.preferences.push(preference);
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { error } = await supabase
    .from("notification_preferences")
    .update({
      whatsapp_opt_in: values.whatsappOptIn,
      weather_alerts: values.weatherAlerts,
      meeting_notices: values.meetingNotices,
      announcements: values.announcements,
      educational_content: values.educationalContent,
      consent_at: values.whatsappOptIn ? now : null,
      updated_at: now,
    })
    .eq("profile_id", profileId);
  if (error) {
    const { error: insertError } = await supabase
      .from("notification_preferences")
      .insert({
        profile_id: profileId,
        whatsapp_opt_in: values.whatsappOptIn,
        weather_alerts: values.weatherAlerts,
        meeting_notices: values.meetingNotices,
        announcements: values.announcements,
        educational_content: values.educationalContent,
        consent_at: values.whatsappOptIn ? now : null,
        updated_at: now,
      });
    if (insertError) {
      return { ok: false, error: "No se pudieron guardar las preferencias." };
    }
  }
  return { ok: true };
}

export async function listProfilesWithPreferences(): Promise<
  {
    profile: Profile;
    preference: NotificationPreference;
    cropIds: string[];
  }[]
> {
  if (isDemoMode) {
    const store = getDemoStore();
    return store.profiles.map((profile) => ({
      profile,
      preference:
        store.preferences.find((item) => item.profileId === profile.id) ??
        defaultPreference(profile.id),
      cropIds: store.userCrops[profile.id] ?? [],
    }));
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const [profilesResult, preferencesResult, cropsResult] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("notification_preferences").select("*"),
    supabase.from("user_crops").select("profile_id, crop_id"),
  ]);
  const profiles = ((profilesResult.data ?? []) as unknown as ProfileRow[]).map(
    mapProfile,
  );
  const cropRows = (cropsResult.data ?? []) as unknown as {
    profile_id: string;
    crop_id: string;
  }[];
  const preferences = (preferencesResult.data ?? []) as unknown as {
    profile_id: string;
    whatsapp_opt_in: boolean;
    weather_alerts: boolean;
    meeting_notices: boolean;
    announcements: boolean;
    educational_content: boolean;
    consent_at: string | null;
    updated_at: string;
  }[];
  return profiles.map((profile) => {
    const row = preferences.find((item) => item.profile_id === profile.id);
    return {
      profile,
      cropIds: cropRows
        .filter((item) => item.profile_id === profile.id)
        .map((item) => item.crop_id),
      preference: row
        ? {
            profileId: row.profile_id,
            whatsappOptIn: row.whatsapp_opt_in,
            weatherAlerts: row.weather_alerts,
            meetingNotices: row.meeting_notices,
            announcements: row.announcements,
            educationalContent: row.educational_content,
            consentAt: row.consent_at,
            updatedAt: row.updated_at,
          }
        : defaultPreference(profile.id),
    };
  });
}
