import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import {
  demoDepartmentName,
  demoMunicipalityName,
  demoCommunityName,
  getDemoStore,
} from "@/lib/demo-store";
import type { Meeting } from "@/types/domain";
import type { MeetingInput } from "@/types/inputs";
import {
  MEETING_SELECT,
  mapMeeting,
  type MeetingRow,
} from "@/services/mappers";

export interface MeetingFilters {
  departmentId?: string;
  includePast?: boolean;
  limit?: number;
}

function enrich(meeting: Meeting): Meeting {
  return {
    ...meeting,
    departmentName: demoDepartmentName(meeting.departmentId),
    municipalityName: demoMunicipalityName(meeting.municipalityId),
    communityName: demoCommunityName(meeting.communityId),
  };
}

export async function listMeetings(
  filters: MeetingFilters = {},
): Promise<Meeting[]> {
  if (isDemoMode) {
    const now = Date.now();
    return getDemoStore()
      .meetings.filter(
        (item) =>
          (filters.includePast || new Date(item.startsAt).getTime() >= now) &&
          (!filters.departmentId ||
            item.departmentId === null ||
            item.departmentId === filters.departmentId),
      )
      .sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
      .slice(0, filters.limit ?? 100);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("meetings")
    .select(MEETING_SELECT)
    .order("starts_at", { ascending: true })
    .limit(filters.limit ?? 100);
  if (!filters.includePast) {
    query = query.gte("starts_at", new Date().toISOString());
  }
  if (filters.departmentId) {
    query = query.or(
      `department_id.is.null,department_id.eq.${filters.departmentId}`,
    );
  }
  const { data } = await query;
  return ((data ?? []) as unknown as MeetingRow[]).map(mapMeeting);
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  if (isDemoMode) {
    return getDemoStore().meetings.find((item) => item.id === id) ?? null;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("meetings")
    .select(MEETING_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapMeeting(data as unknown as MeetingRow) : null;
}

export async function createMeeting(
  input: MeetingInput,
  authorId: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const item = enrich({
      id: randomUUID(),
      title: input.title,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location,
      isVirtual: input.isVirtual,
      virtualUrl: input.virtualUrl,
      departmentId: input.departmentId,
      municipalityId: input.municipalityId,
      communityId: input.communityId,
      cropId: input.cropId,
      authorId,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    });
    getDemoStore().meetings.unshift(item);
    return { ok: true, id: item.id };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      author_id: authorId,
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      location: input.location,
      is_virtual: input.isVirtual,
      virtual_url: input.virtualUrl,
      department_id: input.departmentId,
      municipality_id: input.municipalityId,
      community_id: input.communityId,
      crop_id: input.cropId,
      is_demo: false,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "No se pudo crear la reunión." };
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateMeeting(
  id: string,
  input: MeetingInput,
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    const index = store.meetings.findIndex((item) => item.id === id);
    if (index < 0) return { ok: false, error: "Reunión no encontrada." };
    store.meetings[index] = enrich({
      ...store.meetings[index]!,
      title: input.title,
      description: input.description,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location,
      isVirtual: input.isVirtual,
      virtualUrl: input.virtualUrl,
      departmentId: input.departmentId,
      municipalityId: input.municipalityId,
      communityId: input.communityId,
      cropId: input.cropId,
      updatedAt: now,
    });
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { error } = await supabase
    .from("meetings")
    .update({
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      location: input.location,
      is_virtual: input.isVirtual,
      virtual_url: input.virtualUrl,
      department_id: input.departmentId,
      municipality_id: input.municipalityId,
      community_id: input.communityId,
      crop_id: input.cropId,
      updated_at: now,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar la reunión." };
  return { ok: true };
}

export async function deleteMeeting(id: string): Promise<boolean> {
  if (isDemoMode) {
    const store = getDemoStore();
    const before = store.meetings.length;
    store.meetings = store.meetings.filter((item) => item.id !== id);
    return store.meetings.length < before;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { error } = await supabase.from("meetings").delete().eq("id", id);
  return !error;
}
