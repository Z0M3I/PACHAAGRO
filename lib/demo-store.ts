import "server-only";
import {
  demoAnnouncements,
  demoCommunities,
  demoCrops,
  demoEducationalContents,
  demoMeetings,
  demoMunicipalities,
  demoNotificationLogs,
  demoPreferences,
  demoProfiles,
  demoUserCrops,
  demoWeatherAlerts,
  demoWhatsAppMessages,
  demoDepartments,
  demoCategories,
} from "@/lib/demo-data";
import type {
  Announcement,
  Community,
  ContentCategory,
  Crop,
  Department,
  EducationalContent,
  Meeting,
  Municipality,
  NotificationLog,
  NotificationPreference,
  Profile,
  WeatherAlert,
  WhatsAppMessage,
} from "@/types/domain";

export interface DemoStore {
  departments: Department[];
  municipalities: Municipality[];
  communities: Community[];
  crops: Crop[];
  categories: ContentCategory[];
  profiles: Profile[];
  userCrops: Record<string, string[]>;
  announcements: Announcement[];
  meetings: Meeting[];
  weatherAlerts: WeatherAlert[];
  educationalContents: EducationalContent[];
  preferences: NotificationPreference[];
  notificationLogs: NotificationLog[];
  whatsappMessages: WhatsAppMessage[];
}

function createStore(): DemoStore {
  return {
    departments: structuredClone(demoDepartments),
    municipalities: structuredClone(demoMunicipalities),
    communities: structuredClone(demoCommunities),
    crops: structuredClone(demoCrops),
    categories: structuredClone(demoCategories),
    profiles: structuredClone(demoProfiles),
    userCrops: structuredClone(demoUserCrops),
    announcements: structuredClone(demoAnnouncements),
    meetings: structuredClone(demoMeetings),
    weatherAlerts: structuredClone(demoWeatherAlerts),
    educationalContents: structuredClone(demoEducationalContents),
    preferences: structuredClone(demoPreferences),
    notificationLogs: structuredClone(demoNotificationLogs),
    whatsappMessages: structuredClone(demoWhatsAppMessages),
  };
}

/**
 * Almacén en memoria para el modo demostración.
 *
 * Los cambios (crear una publicación, actualizar preferencias) se conservan
 * mientras viva el proceso del servidor. No se comparten entre instancias ni
 * sobreviven a un despliegue. Sirve para presentar el flujo completo sin
 * credenciales; para persistencia real se configura Supabase.
 */
const globalStore = globalThis as unknown as { __pachaDemoStore?: DemoStore };

export function getDemoStore(): DemoStore {
  if (!globalStore.__pachaDemoStore) {
    globalStore.__pachaDemoStore = createStore();
  }
  return globalStore.__pachaDemoStore;
}

export function resetDemoStore(): void {
  globalStore.__pachaDemoStore = createStore();
}

export function demoDepartmentName(id: string | null): string | null {
  if (!id) return null;
  return getDemoStore().departments.find((item) => item.id === id)?.name ?? null;
}

export function demoMunicipalityName(id: string | null): string | null {
  if (!id) return null;
  return getDemoStore().municipalities.find((item) => item.id === id)?.name ?? null;
}

export function demoCommunityName(id: string | null): string | null {
  if (!id) return null;
  return getDemoStore().communities.find((item) => item.id === id)?.name ?? null;
}

export function demoCropName(id: string | null): string | null {
  if (!id) return null;
  return getDemoStore().crops.find((item) => item.id === id)?.name ?? null;
}

export function demoCategoryName(id: string | null): string | null {
  if (!id) return null;
  return getDemoStore().categories.find((item) => item.id === id)?.name ?? null;
}
