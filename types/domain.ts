export type UserRole =
  | "admin"
  | "producer"
  | "association_manager"
  | "content_editor";

export type AnnouncementType =
  | "announcement"
  | "communique"
  | "weather"
  | "meeting"
  | "event";

export type AudienceScope =
  | "national"
  | "department"
  | "municipality"
  | "community"
  | "crop";

export type EducationalContentType =
  | "guide"
  | "crop_info"
  | "care"
  | "calendar"
  | "pest"
  | "disease"
  | "good_practice"
  | "soil";

export type AlertSeverity = "info" | "moderate" | "severe" | "extreme";

export type NotificationChannel = "whatsapp" | "in_app";

export type NotificationKind =
  | "weather_alert"
  | "meeting"
  | "announcement"
  | "educational"
  | "system";

export type NotificationStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "simulated";

export type MessageDirection = "inbound" | "outbound";

export interface Department {
  id: string;
  name: string;
  code: string;
  slug: string;
  latitude: number;
  longitude: number;
}

export interface Municipality {
  id: string;
  departmentId: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
}

export interface Community {
  id: string;
  municipalityId: string;
  name: string;
  slug: string;
}

export interface Crop {
  id: string;
  name: string;
  slug: string;
  scientificName: string | null;
  description: string | null;
}

export interface Profile {
  id: string;
  email: string | null;
  fullName: string;
  phone: string | null;
  role: UserRole;
  departmentId: string | null;
  municipalityId: string | null;
  communityId: string | null;
  avatarUrl: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser extends Profile {
  departmentName: string | null;
  municipalityName: string | null;
  communityName: string | null;
  cropIds: string[];
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  type: AnnouncementType;
  audienceScope: AudienceScope;
  departmentId: string | null;
  municipalityId: string | null;
  communityId: string | null;
  cropId: string | null;
  authorId: string | null;
  authorName: string | null;
  isDemo: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  departmentName?: string | null;
  municipalityName?: string | null;
  communityName?: string | null;
  cropName?: string | null;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  isVirtual: boolean;
  virtualUrl: string | null;
  departmentId: string | null;
  municipalityId: string | null;
  communityId: string | null;
  cropId: string | null;
  authorId: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  departmentName?: string | null;
  municipalityName?: string | null;
  communityName?: string | null;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  source: string;
  startsAt: string;
  endsAt: string | null;
  departmentId: string | null;
  municipalityId: string | null;
  communityId: string | null;
  isDemo: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  departmentName?: string | null;
  municipalityName?: string | null;
}

export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface EducationalContent {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  categoryId: string;
  cropId: string | null;
  departmentId: string | null;
  contentType: EducationalContentType;
  readingMinutes: number;
  coverImageUrl: string | null;
  sourceNotes: string | null;
  isDemo: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string | null;
  cropName?: string | null;
  departmentName?: string | null;
}

export interface NotificationPreference {
  profileId: string;
  whatsappOptIn: boolean;
  weatherAlerts: boolean;
  meetingNotices: boolean;
  announcements: boolean;
  educationalContent: boolean;
  consentAt: string | null;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  profileId: string | null;
  waMessageId: string | null;
  direction: MessageDirection;
  phone: string;
  messageType: string;
  body: string;
  templateName: string | null;
  status: NotificationStatus;
  errorMessage: string | null;
  isSimulated: boolean;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  profileId: string | null;
  channel: NotificationChannel;
  notificationType: NotificationKind;
  referenceId: string | null;
  recipientName: string | null;
  recipientPhone: string;
  status: NotificationStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  isSimulated: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  producers: number;
  departmentsRepresented: number;
  announcements: number;
  activeAlerts: number;
  upcomingMeetings: number;
  educationalContents: number;
  notificationsSent: number;
}

export interface WeatherLocation {
  name: string;
  departmentName: string | null;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface WeatherCurrent {
  temperatureC: number;
  apparentTemperatureC: number | null;
  humidity: number | null;
  precipitationMm: number | null;
  windKmh: number | null;
  weatherCode: number;
  condition: string;
}

export interface WeatherDay {
  date: string;
  tempMinC: number;
  tempMaxC: number;
  precipitationMm: number;
  precipitationProbability: number | null;
  weatherCode: number;
  condition: string;
}

export interface WeatherSnapshot {
  location: WeatherLocation;
  current: WeatherCurrent;
  daily: WeatherDay[];
  fetchedAt: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  isOfficial: boolean;
  timezone: string;
}

export interface WeatherResult {
  ok: boolean;
  data: WeatherSnapshot | null;
  error: string | null;
  sourceAttempted: string | null;
  notice?: string | null;
}

export interface NotificationCandidate {
  profile: Profile;
  preference: NotificationPreference;
}
