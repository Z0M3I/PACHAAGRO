import type { AudienceScope, SessionUser } from "@/types/domain";

export interface AnnouncementAudience {
  audienceScope: AudienceScope;
  departmentId: string | null;
  municipalityId: string | null;
  communityId: string | null;
  cropId: string | null;
}

export type AudienceUser = Pick<
  SessionUser,
  "departmentId" | "municipalityId" | "communityId" | "cropIds"
>;

/**
 * Regla central de segmentación: una publicación es relevante para un usuario
 * si su alcance coincide con la ubicación o los cultivos del productor.
 */
export function announcementMatchesUser(
  announcement: AnnouncementAudience,
  user: AudienceUser,
): boolean {
  switch (announcement.audienceScope) {
    case "national":
      return true;
    case "department":
      return Boolean(
        announcement.departmentId &&
          announcement.departmentId === user.departmentId,
      );
    case "municipality":
      return Boolean(
        announcement.municipalityId &&
          announcement.municipalityId === user.municipalityId,
      );
    case "community":
      return Boolean(
        announcement.communityId &&
          announcement.communityId === user.communityId,
      );
    case "crop":
      return Boolean(
        announcement.cropId && user.cropIds.includes(announcement.cropId),
      );
    default:
      return false;
  }
}
