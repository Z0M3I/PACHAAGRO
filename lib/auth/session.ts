import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/constants";
import { canViewAdminPanel } from "@/lib/auth/permissions";
import type { ProfileRow } from "@/services/mappers";
import { mapProfile } from "@/services/mappers";
import type { SessionUser, UserRole } from "@/types/domain";

function withLocationNames(
  profile: Omit<
    SessionUser,
    "departmentName" | "municipalityName" | "communityName"
  >,
  departments: { id: string; name: string }[],
  municipalities: { id: string; name: string }[],
  communities: { id: string; name: string }[],
): SessionUser {
  return {
    ...profile,
    departmentName:
      departments.find((item) => item.id === profile.departmentId)?.name ?? null,
    municipalityName:
      municipalities.find((item) => item.id === profile.municipalityId)?.name ??
      null,
    communityName:
      communities.find((item) => item.id === profile.communityId)?.name ?? null,
  };
}

async function getDemoUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const profileId = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  if (!profileId) return null;

  const store = getDemoStore();
  const profile = store.profiles.find((item) => item.id === profileId);
  if (!profile) return null;

  return withLocationNames(
    {
      ...profile,
      cropIds: store.userCrops[profile.id] ?? [],
    },
    store.departments,
    store.municipalities,
    store.communities,
  );
}

async function getSupabaseUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) return null;

  const profile = mapProfile(profileData as unknown as ProfileRow);

  const [cropsResult, departmentsResult, municipalitiesResult, communitiesResult] =
    await Promise.all([
      supabase.from("user_crops").select("crop_id").eq("profile_id", user.id),
      supabase.from("departments").select("id, name"),
      supabase.from("municipalities").select("id, name"),
      supabase.from("communities").select("id, name"),
    ]);

  const cropRows = (cropsResult.data ?? []) as unknown as { crop_id: string }[];

  return {
    ...profile,
    email: profile.email ?? user.email ?? null,
    cropIds: cropRows.map((row) => row.crop_id),
    departmentName:
      (
        (departmentsResult.data ?? []) as unknown as {
          id: string;
          name: string;
        }[]
      ).find((item) => item.id === profile.departmentId)?.name ?? null,
    municipalityName:
      (
        (municipalitiesResult.data ?? []) as unknown as {
          id: string;
          name: string;
        }[]
      ).find((item) => item.id === profile.municipalityId)?.name ?? null,
    communityName:
      (
        (communitiesResult.data ?? []) as unknown as {
          id: string;
          name: string;
        }[]
      ).find((item) => item.id === profile.communityId)?.name ?? null,
  };
}

/** Usuario autenticado de la petición actual (Supabase o demo). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (isDemoMode) return getDemoUser();
  return getSupabaseUser();
});

export async function requireUser(
  nextPath = "/panel",
): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireRole(
  roles: UserRole[],
  nextPath = "/panel",
): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  if (!roles.includes(user.role)) {
    redirect("/panel?denied=1");
  }
  return user;
}

export async function requireAdmin(nextPath = "/admin"): Promise<SessionUser> {
  return requireRole(["admin"], nextPath);
}

export async function requireAdminPanel(
  nextPath = "/admin",
): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  if (!canViewAdminPanel(user.role)) {
    redirect("/panel?denied=1");
  }
  return user;
}

export function postLoginPath(role: UserRole, requested?: string | null): string {
  if (requested && requested.startsWith("/") && !requested.startsWith("//")) {
    if (requested.startsWith("/admin") && canViewAdminPanel(role)) {
      return requested;
    }
    if (requested.startsWith("/panel")) return requested;
  }
  return canViewAdminPanel(role) ? "/admin" : "/panel";
}
