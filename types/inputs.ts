import type {
  AlertSeverity,
  AnnouncementType,
  AudienceScope,
  EducationalContentType,
} from "@/types/domain";

export interface AnnouncementInput {
  title: string;
  summary: string;
  body: string;
  type: AnnouncementType;
  audienceScope: AudienceScope;
  departmentId: string | null;
  municipalityId: string | null;
  communityId: string | null;
  cropId: string | null;
  isPublished: boolean;
  expiresAt: string | null;
}

export interface MeetingInput {
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
}

export interface WeatherAlertInput {
  title: string;
  description: string;
  severity: AlertSeverity;
  source: string;
  startsAt: string;
  endsAt: string | null;
  departmentId: string | null;
  municipalityId: string | null;
  communityId: string | null;
  isActive: boolean;
}

export interface EducationalContentInput {
  title: string;
  summary: string;
  body: string;
  categoryId: string;
  cropId: string | null;
  departmentId: string | null;
  contentType: EducationalContentType;
  readingMinutes: number;
  coverImageUrl: string | null;
  sourceNotes: string | null;
  isPublished: boolean;
}

export interface ProfileUpdateInput {
  fullName: string;
  phone: string;
  departmentId: string;
  municipalityId: string;
  communityId: string | null;
  cropIds: string[];
}
