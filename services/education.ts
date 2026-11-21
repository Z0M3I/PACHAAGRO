import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import {
  demoCategoryName,
  demoCropName,
  demoDepartmentName,
  getDemoStore,
} from "@/lib/demo-store";
import { slugify } from "@/lib/utils";
import type { EducationalContent } from "@/types/domain";
import type { EducationalContentInput } from "@/types/inputs";
import {
  CONTENT_SELECT,
  mapContent,
  type ContentRow,
} from "@/services/mappers";

export interface ContentFilters {
  cropId?: string;
  departmentId?: string;
  categoryId?: string;
  contentType?: string;
  search?: string;
  includeUnpublished?: boolean;
  limit?: number;
}

function isVisible(content: EducationalContent, includeUnpublished = false) {
  return content.isPublished || includeUnpublished;
}

function matches(content: EducationalContent, filters: ContentFilters) {
  if (filters.cropId && content.cropId !== filters.cropId) return false;
  if (
    filters.departmentId &&
    content.departmentId !== filters.departmentId &&
    content.departmentId !== null
  ) {
    return false;
  }
  if (filters.categoryId && content.categoryId !== filters.categoryId) {
    return false;
  }
  if (filters.contentType && content.contentType !== filters.contentType) {
    return false;
  }
  if (filters.search) {
    const haystack =
      `${content.title} ${content.summary} ${content.body}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

function enrich(content: EducationalContent): EducationalContent {
  return {
    ...content,
    categoryName: demoCategoryName(content.categoryId),
    cropName: demoCropName(content.cropId),
    departmentName: demoDepartmentName(content.departmentId),
  };
}

export async function listEducationalContents(
  filters: ContentFilters = {},
): Promise<EducationalContent[]> {
  if (isDemoMode) {
    return getDemoStore()
      .educationalContents.filter((item) =>
        isVisible(item, filters.includeUnpublished),
      )
      .filter((item) => matches(item, filters))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, filters.limit ?? 100);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("educational_contents")
    .select(CONTENT_SELECT)
    .order("updated_at", { ascending: false })
    .limit(filters.limit ?? 100);

  if (!filters.includeUnpublished) query = query.eq("is_published", true);
  if (filters.cropId) query = query.eq("crop_id", filters.cropId);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.contentType)
    query = query.eq("content_type", filters.contentType);
  if (filters.departmentId)
    query = query.or(
      `department_id.is.null,department_id.eq.${filters.departmentId}`,
    );
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data } = await query;
  return ((data ?? []) as unknown as ContentRow[]).map(mapContent);
}

export async function getContentBySlug(
  slug: string,
): Promise<EducationalContent | null> {
  if (isDemoMode) {
    return (
      getDemoStore().educationalContents.find(
        (item) => item.slug === slug && isVisible(item),
      ) ?? null
    );
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("educational_contents")
    .select(CONTENT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ? mapContent(data as unknown as ContentRow) : null;
}

export async function getContentById(
  id: string,
): Promise<EducationalContent | null> {
  if (isDemoMode) {
    return getDemoStore().educationalContents.find((item) => item.id === id) ?? null;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("educational_contents")
    .select(CONTENT_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? mapContent(data as unknown as ContentRow) : null;
}

export async function createContent(
  input: EducationalContentInput,
  authorId: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const item = enrich({
      id: randomUUID(),
      slug: `${slugify(input.title)}-${randomUUID().slice(0, 6)}`,
      title: input.title,
      summary: input.summary,
      body: input.body,
      categoryId: input.categoryId,
      cropId: input.cropId,
      departmentId: input.departmentId,
      contentType: input.contentType,
      readingMinutes: input.readingMinutes,
      coverImageUrl: input.coverImageUrl,
      sourceNotes: input.sourceNotes,
      isDemo: true,
      isPublished: input.isPublished,
      createdAt: now,
      updatedAt: now,
    });
    getDemoStore().educationalContents.unshift(item);
    return { ok: true, id: item.id };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { data, error } = await supabase
    .from("educational_contents")
    .insert({
      author_id: authorId,
      title: input.title,
      slug: `${slugify(input.title)}-${randomUUID().slice(0, 6)}`,
      summary: input.summary,
      body: input.body,
      category_id: input.categoryId,
      crop_id: input.cropId,
      department_id: input.departmentId,
      content_type: input.contentType,
      reading_minutes: input.readingMinutes,
      cover_image_url: input.coverImageUrl,
      source_notes: input.sourceNotes,
      is_demo: false,
      is_published: input.isPublished,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "No se pudo crear el contenido." };
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateContent(
  id: string,
  input: EducationalContentInput,
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();
  if (isDemoMode) {
    const store = getDemoStore();
    const index = store.educationalContents.findIndex((item) => item.id === id);
    if (index < 0) return { ok: false, error: "Contenido no encontrado." };
    store.educationalContents[index] = enrich({
      ...store.educationalContents[index]!,
      title: input.title,
      summary: input.summary,
      body: input.body,
      categoryId: input.categoryId,
      cropId: input.cropId,
      departmentId: input.departmentId,
      contentType: input.contentType,
      readingMinutes: input.readingMinutes,
      coverImageUrl: input.coverImageUrl,
      sourceNotes: input.sourceNotes,
      isPublished: input.isPublished,
      updatedAt: now,
    });
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Base de datos no disponible." };
  const { error } = await supabase
    .from("educational_contents")
    .update({
      title: input.title,
      summary: input.summary,
      body: input.body,
      category_id: input.categoryId,
      crop_id: input.cropId,
      department_id: input.departmentId,
      content_type: input.contentType,
      reading_minutes: input.readingMinutes,
      cover_image_url: input.coverImageUrl,
      source_notes: input.sourceNotes,
      is_published: input.isPublished,
      updated_at: now,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar el contenido." };
  return { ok: true };
}

export async function deleteContent(id: string): Promise<boolean> {
  if (isDemoMode) {
    const store = getDemoStore();
    const before = store.educationalContents.length;
    store.educationalContents = store.educationalContents.filter(
      (item) => item.id !== id,
    );
    return store.educationalContents.length < before;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from("educational_contents")
    .delete()
    .eq("id", id);
  return !error;
}
