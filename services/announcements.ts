import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import {
  demoCommunityName,
  demoDepartmentName,
  demoMunicipalityName,
  demoCropName,
  getDemoStore,
} from "@/lib/demo-store";
import { slugify } from "@/lib/utils";
import {
  announcementMatchesUser as matchesUserAudience,
} from "@/lib/announcements-audience";
import type { Announcement, SessionUser } from "@/types/domain";
import type { AnnouncementInput } from "@/types/inputs";
import {
  ANNOUNCEMENT_SELECT,
  mapAnnouncement,
  type AnnouncementRow,
} from "@/services/mappers";

export interface AnnouncementFilters {
  departmentId?: string;
  municipalityId?: string;
  cropId?: string;
  type?: string;
  scope?: string;
  search?: string;
  includeUnpublished?: boolean;
  limit?: number;
}

function isVisible(announcement: Announcement, includeUnpublished = false): boolean {
  if (!announcement.isPublished && !includeUnpublished) return false;
  if (
    announcement.expiresAt &&
    new Date(announcement.expiresAt) < new Date() &&
    !includeUnpublished
  ) {
    return false;
  }
  return true;
}

function matchesFilters(
  announcement: Announcement,
  filters: AnnouncementFilters,
): boolean {
  if (filters.departmentId && announcement.departmentId !== filters.departmentId) {
    return false;
  }
  if (
    filters.municipalityId &&
    announcement.municipalityId !== filters.municipalityId
  ) {
    return false;
  }
  if (filters.cropId && announcement.cropId !== filters.cropId) return false;
  if (filters.type && announcement.type !== filters.type) return false;
  if (filters.scope && announcement.audienceScope !== filters.scope) return false;
  if (filters.search) {
    const haystack =
      `${announcement.title} ${announcement.summary} ${announcement.body}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

export function announcementMatchesUser(
  announcement: Announcement,
  user: Pick<
    SessionUser,
    "departmentId" | "municipalityId" | "communityId" | "cropIds"
  >,
): boolean {
  return matchesUserAudience(announcement, user);
}

export async function listAnnouncements(
  filters: AnnouncementFilters = {},
): Promise<Announcement[]> {
  if (isDemoMode) {
    const store = getDemoStore();
    return store.announcements
      .filter((item) => isVisible(item, filters.includeUnpublished))
      .filter((item) => matchesFilters(item, filters))
      .sort(
        (a, b) =>
          new Date(b.publishedAt ?? b.createdAt).getTime() -
          new Date(a.publishedAt ?? a.createdAt).getTime(),
      )
      .slice(0, filters.limit ?? 100);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("announcements")
    .select(ANNOUNCEMENT_SELECT)
    .order("published_at", { ascending: false })
    .limit(filters.limit ?? 100);

  if (!filters.includeUnpublished) {
    query = query
      .eq("is_published", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  }
  if (filters.departmentId) query = query.eq("department_id", filters.departmentId);
  if (filters.municipalityId)
    query = query.eq("municipality_id", filters.municipalityId);
  if (filters.cropId) query = query.eq("crop_id", filters.cropId);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.scope) query = query.eq("audience_scope", filters.scope);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data } = await query;
  return ((data ?? []) as unknown as AnnouncementRow[]).map(mapAnnouncement);
}

export async function listAnnouncementsForUser(
  user: SessionUser,
  filters: AnnouncementFilters = {},
): Promise<Announcement[]> {
  const announcements = await listAnnouncements(filters);
  return announcements.filter((item) => announcementMatchesUser(item, user));
}

export async function getAnnouncementById(
  id: string,
  includeUnpublished = true,
): Promise<Announcement | null> {
  if (isDemoMode) {
    const item = getDemoStore().announcements.find((row) => row.id === id);
    if (!item) return null;
    if (!includeUnpublished && !isVisible(item)) return null;
    return item;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  let query = supabase
    .from("announcements")
    .select(ANNOUNCEMENT_SELECT)
    .eq("id", id);
  if (!includeUnpublished) query = query.eq("is_published", true);
  const { data } = await query.maybeSingle();
  return data ? mapAnnouncement(data as unknown as AnnouncementRow) : null;
}

export async function getAnnouncementBySlug(
  slug: string,
): Promise<Announcement | null> {
  if (isDemoMode) {
    return (
      getDemoStore().announcements.find(
        (item) => item.slug === slug && isVisible(item),
      ) ?? null
    );
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("announcements")
    .select(ANNOUNCEMENT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle();
  return data ? mapAnnouncement(data as unknown as AnnouncementRow) : null;
}

function enrichAnnouncement(
  announcement: Announcement,
): Announcement {
  return {
    ...announcement,
    departmentName: demoDepartmentName(announcement.departmentId),
    municipalityName: demoMunicipalityName(announcement.municipalityId),
    communityName: demoCommunityName(announcement.communityId),
    cropName: demoCropName(announcement.cropId),
  };
}

export async function createAnnouncement(
  input: AnnouncementInput,
  author: SessionUser,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    const item = enrichAnnouncement({
      id: randomUUID(),
      slug: `${slugify(input.title)}-${randomUUID().slice(0, 6)}`,
      title: input.title,
      summary: input.summary,
      body: input.body,
      type: input.type,
      audienceScope: input.audienceScope,
      departmentId: input.departmentId,
      municipalityId: input.municipalityId,
      communityId: input.communityId,
      cropId: input.cropId,
      authorId: author.id,
      authorName: author.fullName,
      isDemo: true,
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? now : null,
      expiresAt: input.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
    store.announcements.unshift(item);
    return { ok: true, id: item.id };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      author_id: author.id,
      title: input.title,
      slug: `${slugify(input.title)}-${randomUUID().slice(0, 6)}`,
      summary: input.summary,
      body: input.body,
      type: input.type,
      audience_scope: input.audienceScope,
      department_id: input.departmentId,
      municipality_id: input.municipalityId,
      community_id: input.communityId,
      crop_id: input.cropId,
      is_demo: false,
      is_published: input.isPublished,
      published_at: input.isPublished ? now : null,
      expires_at: input.expiresAt,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "No se pudo crear la publicación." };
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    const index = store.announcements.findIndex((item) => item.id === id);
    if (index < 0) return { ok: false, error: "Publicación no encontrada." };
    const current = store.announcements[index]!;
    store.announcements[index] = enrichAnnouncement({
      ...current,
      title: input.title,
      summary: input.summary,
      body: input.body,
      type: input.type,
      audienceScope: input.audienceScope,
      departmentId: input.departmentId,
      municipalityId: input.municipalityId,
      communityId: input.communityId,
      cropId: input.cropId,
      isPublished: input.isPublished,
      publishedAt:
        input.isPublished && !current.publishedAt ? now : current.publishedAt,
      expiresAt: input.expiresAt,
      updatedAt: now,
    });
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { error } = await supabase
    .from("announcements")
    .update({
      title: input.title,
      summary: input.summary,
      body: input.body,
      type: input.type,
      audience_scope: input.audienceScope,
      department_id: input.departmentId,
      municipality_id: input.municipalityId,
      community_id: input.communityId,
      crop_id: input.cropId,
      is_published: input.isPublished,
      published_at: input.isPublished ? now : null,
      expires_at: input.expiresAt,
      updated_at: now,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar la publicación." };
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  if (isDemoMode) {
    const store = getDemoStore();
    const before = store.announcements.length;
    store.announcements = store.announcements.filter((item) => item.id !== id);
    return store.announcements.length < before;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  return !error;
}
