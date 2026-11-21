import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import {
  demoDepartmentName,
  demoMunicipalityName,
  getDemoStore,
} from "@/lib/demo-store";
import type { WeatherAlert } from "@/types/domain";
import type { WeatherAlertInput } from "@/types/inputs";
import {
  ALERT_SELECT,
  mapWeatherAlert,
  type WeatherAlertRow,
} from "@/services/mappers";

export interface AlertFilters {
  departmentId?: string;
  municipalityId?: string;
  includeInactive?: boolean;
  limit?: number;
}

function enrich(alert: WeatherAlert): WeatherAlert {
  return {
    ...alert,
    departmentName: demoDepartmentName(alert.departmentId),
    municipalityName: demoMunicipalityName(alert.municipalityId),
  };
}

export async function listWeatherAlerts(
  filters: AlertFilters = {},
): Promise<WeatherAlert[]> {
  if (isDemoMode) {
    return getDemoStore()
      .weatherAlerts.filter(
        (item) =>
          (filters.includeInactive || item.isActive) &&
          (!filters.departmentId ||
            item.departmentId === null ||
            item.departmentId === filters.departmentId) &&
          (!filters.municipalityId ||
            item.municipalityId === null ||
            item.municipalityId === filters.municipalityId),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, filters.limit ?? 100);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("weather_alerts")
    .select(ALERT_SELECT)
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100);
  if (!filters.includeInactive) query = query.eq("is_active", true);
  if (filters.departmentId) {
    query = query.or(
      `department_id.is.null,department_id.eq.${filters.departmentId}`,
    );
  }
  if (filters.municipalityId) {
    query = query.or(
      `municipality_id.is.null,municipality_id.eq.${filters.municipalityId}`,
    );
  }
  const { data } = await query;
  return ((data ?? []) as unknown as WeatherAlertRow[]).map(mapWeatherAlert);
}

export async function getWeatherAlertById(
  id: string,
): Promise<WeatherAlert | null> {
  if (isDemoMode) {
    return getDemoStore().weatherAlerts.find((item) => item.id === id) ?? null;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("weather_alerts")
    .select(ALERT_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapWeatherAlert(data as unknown as WeatherAlertRow) : null;
}

export async function createWeatherAlert(
  input: WeatherAlertInput,
  authorId: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const item = enrich({
      id: randomUUID(),
      title: input.title,
      description: input.description,
      severity: input.severity,
      source: input.source,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      departmentId: input.departmentId,
      municipalityId: input.municipalityId,
      communityId: input.communityId,
      isDemo: true,
      isActive: input.isActive,
      createdAt: now,
      updatedAt: now,
    });
    getDemoStore().weatherAlerts.unshift(item);
    return { ok: true, id: item.id };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { data, error } = await supabase
    .from("weather_alerts")
    .insert({
      author_id: authorId,
      title: input.title,
      description: input.description,
      severity: input.severity,
      source: input.source,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      department_id: input.departmentId,
      municipality_id: input.municipalityId,
      community_id: input.communityId,
      is_demo: false,
      is_active: input.isActive,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "No se pudo crear la alerta." };
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateWeatherAlert(
  id: string,
  input: WeatherAlertInput,
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    const index = store.weatherAlerts.findIndex((item) => item.id === id);
    if (index < 0) return { ok: false, error: "Alerta no encontrada." };
    store.weatherAlerts[index] = enrich({
      ...store.weatherAlerts[index]!,
      title: input.title,
      description: input.description,
      severity: input.severity,
      source: input.source,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      departmentId: input.departmentId,
      municipalityId: input.municipalityId,
      communityId: input.communityId,
      isActive: input.isActive,
      updatedAt: now,
    });
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { error } = await supabase
    .from("weather_alerts")
    .update({
      title: input.title,
      description: input.description,
      severity: input.severity,
      source: input.source,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      department_id: input.departmentId,
      municipality_id: input.municipalityId,
      community_id: input.communityId,
      is_active: input.isActive,
      updated_at: now,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar la alerta." };
  return { ok: true };
}

export async function toggleWeatherAlert(
  id: string,
  isActive: boolean,
): Promise<boolean> {
  if (isDemoMode) {
    const alert = getDemoStore().weatherAlerts.find((item) => item.id === id);
    if (!alert) return false;
    alert.isActive = isActive;
    alert.updatedAt = new Date().toISOString();
    return true;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("weather_alerts")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export async function deleteWeatherAlert(id: string): Promise<boolean> {
  if (isDemoMode) {
    const store = getDemoStore();
    const before = store.weatherAlerts.length;
    store.weatherAlerts = store.weatherAlerts.filter((item) => item.id !== id);
    return store.weatherAlerts.length < before;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { error } = await supabase.from("weather_alerts").delete().eq("id", id);
  return !error;
}
