import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import type { AdminStats, NotificationLog } from "@/types/domain";
import { mapLog, mapProfile, type LogRow, type ProfileRow } from "@/services/mappers";

export async function getAdminStats(): Promise<AdminStats> {
  if (isDemoMode) {
    const store = getDemoStore();
    const now = Date.now();
    return {
      totalUsers: store.profiles.length,
      producers: store.profiles.filter((item) => item.role === "producer").length,
      departmentsRepresented: new Set(
        store.profiles.map((item) => item.departmentId).filter(Boolean),
      ).size,
      announcements: store.announcements.length,
      activeAlerts: store.weatherAlerts.filter((item) => item.isActive).length,
      upcomingMeetings: store.meetings.filter(
        (item) => new Date(item.startsAt).getTime() >= now,
      ).length,
      educationalContents: store.educationalContents.length,
      notificationsSent: store.notificationLogs.length,
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      totalUsers: 0,
      producers: 0,
      departmentsRepresented: 0,
      announcements: 0,
      activeAlerts: 0,
      upcomingMeetings: 0,
      educationalContents: 0,
      notificationsSent: 0,
    };
  }

  const now = new Date().toISOString();
  const [
    profiles,
    announcements,
    alerts,
    meetings,
    contents,
    logs,
  ] = await Promise.all([
    supabase.from("profiles").select("role, department_id"),
    supabase.from("announcements").select("id", { count: "exact", head: true }),
    supabase
      .from("weather_alerts")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", now),
    supabase
      .from("educational_contents")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("notification_logs")
      .select("id", { count: "exact", head: true }),
  ]);

  const profileRows = (profiles.data ?? []) as unknown as {
    role: string;
    department_id: string | null;
  }[];

  return {
    totalUsers: profileRows.length,
    producers: profileRows.filter((row) => row.role === "producer").length,
    departmentsRepresented: new Set(
      profileRows.map((row) => row.department_id).filter(Boolean),
    ).size,
    announcements: announcements.count ?? 0,
    activeAlerts: alerts.count ?? 0,
    upcomingMeetings: meetings.count ?? 0,
    educationalContents: contents.count ?? 0,
    notificationsSent: logs.count ?? 0,
  };
}

export async function listNotificationLogs(options?: {
  limit?: number;
  profileId?: string;
}): Promise<NotificationLog[]> {
  if (isDemoMode) {
    return getDemoStore()
      .notificationLogs.filter(
        (item) => !options?.profileId || item.profileId === options.profileId,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, options?.limit ?? 100);
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("notification_logs")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 100);
  if (options?.profileId) query = query.eq("profile_id", options.profileId);
  const { data } = await query;
  return ((data ?? []) as unknown as LogRow[]).map(mapLog);
}

export async function getRecentRegistrations(limit = 5) {
  if (isDemoMode) {
    return [...getDemoStore().profiles]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as ProfileRow[]).map(mapProfile);
}
