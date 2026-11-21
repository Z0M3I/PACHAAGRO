"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode, env } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import { demoAccounts } from "@/lib/demo-data";
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_MAX_AGE,
} from "@/lib/auth/constants";
import { postLoginPath } from "@/lib/auth/session";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";
import { normalizePhone } from "@/lib/utils";
import { failure, success, type ActionState } from "@/types/actions";
import type { NotificationPreference, Profile } from "@/types/domain";

function safeNext(value: string | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

async function setDemoSession(profileId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_SESSION_MAX_AGE,
  });
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return failure(
      "Revise los datos ingresados.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { email, password } = parsed.data;
  if (isDemoMode) {
    const account = demoAccounts.find(
      (item) => item.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!account || account.password !== password) {
      return failure(
        "Correo o contraseña incorrectos. En modo demo use una de las cuentas de prueba.",
      );
    }
    await setDemoSession(account.id);
    redirect(postLoginPath(account.role, safeNext(parsed.data.next)));
  } else {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return failure(
        "Supabase no está configurado. Revise las variables de entorno.",
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      return failure("Correo o contraseña incorrectos.");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    const role =
      (profile as { role?: string } | null)?.role === "admin"
        ? "admin"
        : (profile as { role?: string } | null)?.role === "content_editor"
          ? "content_editor"
          : (profile as { role?: string } | null)?.role === "association_manager"
            ? "association_manager"
            : "producer";
    redirect(postLoginPath(role, safeNext(parsed.data.next)));
  }
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cropIds = formData.getAll("cropIds").map(String).filter(Boolean);
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    departmentId: formData.get("departmentId"),
    municipalityId: formData.get("municipalityId"),
    communityId: formData.get("communityId") || undefined,
    cropIds,
    whatsappConsent: formData.get("whatsappConsent"),
    termsAccepted: formData.get("termsAccepted"),
  });

  if (!parsed.success) {
    return failure(
      "Revise los datos del formulario.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = parsed.data;
  const phone = normalizePhone(data.phone);
  const communityId = data.communityId || null;

  if (isDemoMode) {
    const store = getDemoStore();
    const exists = store.profiles.some(
      (profile) => profile.email?.toLowerCase() === data.email.toLowerCase(),
    );
    if (exists) {
      return failure("Ya existe una cuenta con ese correo.");
    }

    const now = new Date().toISOString();
    const profileId = randomUUID();
    const profile: Profile = {
      id: profileId,
      email: data.email.toLowerCase(),
      fullName: data.fullName,
      phone,
      role: "producer",
      departmentId: data.departmentId,
      municipalityId: data.municipalityId,
      communityId,
      avatarUrl: null,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    };
    const preference: NotificationPreference = {
      profileId,
      whatsappOptIn: data.whatsappConsent,
      weatherAlerts: true,
      meetingNotices: true,
      announcements: true,
      educationalContent: true,
      consentAt: data.whatsappConsent ? now : null,
      updatedAt: now,
    };
    store.profiles.push(profile);
    store.preferences.push(preference);
    store.userCrops[profileId] = data.cropIds;
    await setDemoSession(profileId);
  } else {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return failure(
        "Supabase no está configurado. Revise las variables de entorno.",
      );
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${env.appUrl}/auth/callback?next=/panel`,
        data: {
          full_name: data.fullName,
          phone,
          department_id: data.departmentId,
          municipality_id: data.municipalityId,
          community_id: communityId,
          crop_ids: data.cropIds,
          whatsapp_consent: data.whatsappConsent,
        },
      },
    });

    if (error) {
      return failure(
        error.message.includes("already registered")
          ? "Ya existe una cuenta con ese correo."
          : "No pudimos crear la cuenta. Intente nuevamente.",
      );
    }

    if (!authData.session) {
      return success(
        "Cuenta creada. Revise su correo para confirmar la dirección y luego inicie sesión.",
      );
    }
  }

  redirect("/panel");
}

export async function signOutAction(): Promise<void> {
  if (isDemoMode) {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_SESSION_COOKIE);
  } else {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  }
  redirect("/");
}
