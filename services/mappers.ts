import type {
  Announcement,
  EducationalContent,
  Meeting,
  NotificationLog,
  NotificationPreference,
  Profile,
  UserRole,
  WeatherAlert,
  WhatsAppMessage,
} from "@/types/domain";

/**
 * Filas tal como llegan de PostgreSQL (snake_case). Se mapean en un único
 * lugar para que el resto de la aplicación use camelCase y tipos de dominio.
 */

export interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MunicipalityRow {
  id: string;
  department_id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CommunityRow {
  id: string;
  municipality_id: string;
  name: string;
  slug: string;
}

export interface CropRow {
  id: string;
  name: string;
  slug: string;
  scientific_name: string | null;
  description: string | null;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  role: UserRole;
  department_id: string | null;
  municipality_id: string | null;
  community_id: string | null;
  avatar_url: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  type: Announcement["type"];
  audience_scope: Announcement["audienceScope"];
  department_id: string | null;
  municipality_id: string | null;
  community_id: string | null;
  crop_id: string | null;
  author_id: string | null;
  is_demo: boolean;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string } | { full_name: string }[] | null;
  departments?: { name: string } | { name: string }[] | null;
  municipalities?: { name: string } | { name: string }[] | null;
  communities?: { name: string } | { name: string }[] | null;
  crops?: { name: string } | { name: string }[] | null;
}

export interface MeetingRow {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location: string;
  is_virtual: boolean;
  virtual_url: string | null;
  department_id: string | null;
  municipality_id: string | null;
  community_id: string | null;
  crop_id: string | null;
  author_id: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  departments?: { name: string } | { name: string }[] | null;
  municipalities?: { name: string } | { name: string }[] | null;
  communities?: { name: string } | { name: string }[] | null;
}

export interface WeatherAlertRow {
  id: string;
  title: string;
  description: string;
  severity: WeatherAlert["severity"];
  source: string;
  starts_at: string;
  ends_at: string | null;
  department_id: string | null;
  municipality_id: string | null;
  community_id: string | null;
  is_demo: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  departments?: { name: string } | { name: string }[] | null;
  municipalities?: { name: string } | { name: string }[] | null;
}

export interface ContentRow {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category_id: string;
  crop_id: string | null;
  department_id: string | null;
  content_type: EducationalContent["contentType"];
  reading_minutes: number;
  cover_image_url: string | null;
  source_notes: string | null;
  is_demo: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  content_categories?: { name: string } | { name: string }[] | null;
  crops?: { name: string } | { name: string }[] | null;
  departments?: { name: string } | { name: string }[] | null;
}

export interface PreferenceRow {
  profile_id: string;
  whatsapp_opt_in: boolean;
  weather_alerts: boolean;
  meeting_notices: boolean;
  announcements: boolean;
  educational_content: boolean;
  consent_at: string | null;
  updated_at: string;
}

export interface LogRow {
  id: string;
  profile_id: string | null;
  channel: NotificationLog["channel"];
  notification_type: NotificationLog["notificationType"];
  reference_id: string | null;
  recipient_phone: string;
  status: NotificationLog["status"];
  provider_message_id: string | null;
  error_message: string | null;
  is_simulated: boolean;
  created_at: string;
  profiles?: { full_name: string } | { full_name: string }[] | null;
}

export interface MessageRow {
  id: string;
  profile_id: string | null;
  wa_message_id: string | null;
  direction: WhatsAppMessage["direction"];
  phone: string;
  message_type: string;
  body: string;
  template_name: string | null;
  status: WhatsAppMessage["status"];
  error_message: string | null;
  is_simulated: boolean;
  created_at: string;
}

function pickName(
  value: { name: string } | { name: string }[] | null | undefined,
): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0]?.name ?? null;
  return value.name;
}

function pickFullName(
  value: { full_name: string } | { full_name: string }[] | null | undefined,
): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0]?.full_name ?? null;
  return value.full_name;
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
    departmentId: row.department_id,
    municipalityId: row.municipality_id,
    communityId: row.community_id,
    avatarUrl: row.avatar_url,
    isDemo: row.is_demo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    type: row.type,
    audienceScope: row.audience_scope,
    departmentId: row.department_id,
    municipalityId: row.municipality_id,
    communityId: row.community_id,
    cropId: row.crop_id,
    authorId: row.author_id,
    authorName: pickFullName(row.profiles),
    isDemo: row.is_demo,
    isPublished: row.is_published,
    publishedAt: row.published_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    departmentName: pickName(row.departments),
    municipalityName: pickName(row.municipalities),
    communityName: pickName(row.communities),
    cropName: pickName(row.crops),
  };
}

export function mapMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    isVirtual: row.is_virtual,
    virtualUrl: row.virtual_url,
    departmentId: row.department_id,
    municipalityId: row.municipality_id,
    communityId: row.community_id,
    cropId: row.crop_id,
    authorId: row.author_id,
    isDemo: row.is_demo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    departmentName: pickName(row.departments),
    municipalityName: pickName(row.municipalities),
    communityName: pickName(row.communities),
  };
}

export function mapWeatherAlert(row: WeatherAlertRow): WeatherAlert {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    source: row.source,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    departmentId: row.department_id,
    municipalityId: row.municipality_id,
    communityId: row.community_id,
    isDemo: row.is_demo,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    departmentName: pickName(row.departments),
    municipalityName: pickName(row.municipalities),
  };
}

export function mapContent(row: ContentRow): EducationalContent {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    categoryId: row.category_id,
    cropId: row.crop_id,
    departmentId: row.department_id,
    contentType: row.content_type,
    readingMinutes: row.reading_minutes,
    coverImageUrl: row.cover_image_url,
    sourceNotes: row.source_notes,
    isDemo: row.is_demo,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryName: pickName(row.content_categories),
    cropName: pickName(row.crops),
    departmentName: pickName(row.departments),
  };
}

export function mapPreference(row: PreferenceRow): NotificationPreference {
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

export function mapLog(row: LogRow): NotificationLog {
  return {
    id: row.id,
    profileId: row.profile_id,
    channel: row.channel,
    notificationType: row.notification_type,
    referenceId: row.reference_id,
    recipientName: pickFullName(row.profiles),
    recipientPhone: row.recipient_phone,
    status: row.status,
    providerMessageId: row.provider_message_id,
    errorMessage: row.error_message,
    isSimulated: row.is_simulated,
    createdAt: row.created_at,
  };
}

export function mapMessage(row: MessageRow): WhatsAppMessage {
  return {
    id: row.id,
    profileId: row.profile_id,
    waMessageId: row.wa_message_id,
    direction: row.direction,
    phone: row.phone,
    messageType: row.message_type,
    body: row.body,
    templateName: row.template_name,
    status: row.status,
    errorMessage: row.error_message,
    isSimulated: row.is_simulated,
    createdAt: row.created_at,
  };
}

export const ANNOUNCEMENT_SELECT =
  "*, departments(name), municipalities(name), communities(name), crops(name)";
export const MEETING_SELECT =
  "*, departments(name), municipalities(name), communities(name)";
export const ALERT_SELECT =
  "*, departments(name), municipalities(name)";
export const CONTENT_SELECT =
  "*, content_categories(name), crops(name), departments(name)";
export const LOG_SELECT = "*, profiles(full_name)";
export const CATEGORY_ROW = "*";
