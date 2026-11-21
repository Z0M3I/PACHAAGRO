import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import type {
  Community,
  ContentCategory,
  Crop,
  Department,
  Municipality,
} from "@/types/domain";
import type {
  CategoryRow,
  CommunityRow,
  CropRow,
  DepartmentRow,
  MunicipalityRow,
} from "@/services/mappers";

export async function getDepartments(): Promise<Department[]> {
  if (isDemoMode) {
    return [...getDemoStore().departments].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("departments").select("*").order("name");
  return ((data ?? []) as unknown as DepartmentRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    slug: row.slug,
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
  }));
}

export async function getMunicipalities(
  departmentId?: string,
): Promise<Municipality[]> {
  if (isDemoMode) {
    return getDemoStore()
      .municipalities.filter(
        (item) => !departmentId || item.departmentId === departmentId,
      )
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase.from("municipalities").select("*").order("name");
  if (departmentId) query = query.eq("department_id", departmentId);
  const { data } = await query;
  return ((data ?? []) as unknown as MunicipalityRow[]).map((row) => ({
    id: row.id,
    departmentId: row.department_id,
    name: row.name,
    slug: row.slug,
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
  }));
}

export async function getCommunities(
  municipalityId?: string,
): Promise<Community[]> {
  if (isDemoMode) {
    return getDemoStore()
      .communities.filter(
        (item) => !municipalityId || item.municipalityId === municipalityId,
      )
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase.from("communities").select("*").order("name");
  if (municipalityId) query = query.eq("municipality_id", municipalityId);
  const { data } = await query;
  return ((data ?? []) as unknown as CommunityRow[]).map((row) => ({
    id: row.id,
    municipalityId: row.municipality_id,
    name: row.name,
    slug: row.slug,
  }));
}

export async function getCrops(): Promise<Crop[]> {
  if (isDemoMode) {
    return [...getDemoStore().crops].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("crops").select("*").order("name");
  return ((data ?? []) as unknown as CropRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    scientificName: row.scientific_name,
    description: row.description,
  }));
}

export async function getContentCategories(): Promise<ContentCategory[]> {
  if (isDemoMode) {
    return [...getDemoStore().categories].sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("content_categories")
    .select("*")
    .order("name");
  return ((data ?? []) as unknown as CategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
  }));
}
