import "server-only";
import { env } from "@/lib/env";
import { announcementMatchesUser } from "@/services/announcements";
import { listProfilesWithPreferences } from "@/services/profiles";
import {
  buildAlertTemplate,
  buildAnnouncementTemplate,
  buildEducationTemplate,
  buildMeetingTemplate,
  type TemplatePayload,
} from "@/services/whatsapp/templates";
import { sendTemplateMessage } from "@/services/whatsapp/meta-client";
import {
  recordNotificationLog,
  recordOutboundMessage,
} from "@/services/whatsapp/messages";
import type {
  Announcement,
  EducationalContent,
  Meeting,
  NotificationKind,
  NotificationPreference,
  Profile,
  WeatherAlert,
} from "@/types/domain";

interface DispatchTarget {
  kind: NotificationKind;
  referenceId: string;
  url: string;
  announcement?: Announcement;
  meeting?: Meeting;
  alert?: WeatherAlert;
  content?: EducationalContent;
}

export interface DispatchSummary {
  totalCandidates: number;
  sent: number;
  simulated: number;
  failed: number;
  skipped: number;
  errors: string[];
  simulatedMode: boolean;
}

const MAX_PER_DISPATCH = 50;

function buildTemplate(target: DispatchTarget): TemplatePayload {
  const url = target.url;
  switch (target.kind) {
    case "weather_alert": {
      const alert = target.alert!;
      return buildAlertTemplate({
        title: alert.title,
        description: alert.description,
        location: alert.municipalityName
          ? `${alert.municipalityName}, ${alert.departmentName ?? "Bolivia"}`
          : (alert.departmentName ?? "Toda Bolivia"),
        validity: alert.endsAt ? `Hasta ${alert.endsAt.slice(0, 10)}` : "Vigente",
        url,
      });
    }
    case "meeting": {
      const meeting = target.meeting!;
      return buildMeetingTemplate({
        title: meeting.title,
        startsAt: meeting.startsAt,
        location: meeting.location,
        description: meeting.description,
        url,
      });
    }
    case "educational": {
      const content = target.content!;
      return buildEducationTemplate({
        title: content.title,
        summary: content.summary,
        url,
      });
    }
    case "announcement":
    default: {
      const announcement = target.announcement!;
      return buildAnnouncementTemplate({
        title: announcement.title,
        summary: announcement.summary,
        url,
      });
    }
  }
}

function interestEnabled(
  preference: NotificationPreference,
  kind: NotificationKind,
): boolean {
  switch (kind) {
    case "weather_alert":
      return preference.weatherAlerts;
    case "meeting":
      return preference.meetingNotices;
    case "announcement":
      return preference.announcements;
    case "educational":
      return preference.educationalContent;
    default:
      return false;
  }
}

function inScope(
  profile: Profile,
  cropIds: string[],
  target: DispatchTarget,
): boolean {
  switch (target.kind) {
    case "weather_alert": {
      const alert = target.alert!;
      if (!alert.departmentId) return true;
      if (profile.departmentId !== alert.departmentId) return false;
      if (alert.municipalityId && profile.municipalityId !== alert.municipalityId) {
        return false;
      }
      return true;
    }
    case "meeting": {
      const meeting = target.meeting!;
      if (meeting.departmentId && profile.departmentId !== meeting.departmentId) {
        return false;
      }
      if (
        meeting.municipalityId &&
        profile.municipalityId !== meeting.municipalityId
      ) {
        return false;
      }
      return true;
    }
    case "announcement": {
      const announcement = target.announcement!;
      return announcementMatchesUser(announcement, {
        departmentId: profile.departmentId,
        municipalityId: profile.municipalityId,
        communityId: profile.communityId,
        cropIds,
      });
    }
    case "educational":
      return true;
    default:
      return false;
  }
}

/**
 * Envía una notificación por WhatsApp a los usuarios que dieron su
 * consentimiento y cumplen el alcance geográfico/productivo.
 *
 * Si faltan credenciales de Meta, no se realiza ninguna petición: cada envío
 * queda registrado como SIMULADO, nunca como enviado.
 */
export async function dispatchNotification(
  target: DispatchTarget,
): Promise<DispatchSummary> {
  const pairs = await listProfilesWithPreferences();
  const eligible = pairs
    .filter(({ profile, preference, cropIds }) => {
      if (!profile.phone) return false;
      if (!preference.whatsappOptIn) return false;
      if (!interestEnabled(preference, target.kind)) return false;
      return inScope(profile, cropIds, target);
    })
    .slice(0, MAX_PER_DISPATCH);

  const template = buildTemplate(target);
  let sent = 0;
  let simulated = 0;
  let failed = 0;
  const errors: string[] = [];

  // Lotes pequeños para no saturar la API de Meta ni exceder el tiempo de
  // una función serverless.
  for (let index = 0; index < eligible.length; index += 5) {
    const batch = eligible.slice(index, index + 5);
    await Promise.all(
      batch.map(async ({ profile }) => {
        const result = await sendTemplateMessage({
          to: profile.phone!,
          templateName: template.templateName,
          parameters: template.parameters,
        });

        if (result.simulated) simulated += 1;
        else if (result.ok) sent += 1;
        else {
          failed += 1;
          if (result.error && errors.length < 3) errors.push(result.error);
        }

        await recordOutboundMessage(
          {
            profileId: profile.id,
            phone: profile.phone!,
            body: template.preview,
            templateName: template.templateName,
            messageType: "template",
          },
          result,
        );

        await recordNotificationLog({
          profileId: profile.id,
          channel: "whatsapp",
          notificationType: target.kind,
          referenceId: target.referenceId,
          recipientPhone: profile.phone!,
          status: result.simulated ? "simulated" : result.ok ? "sent" : "failed",
          providerMessageId: result.messageId,
          errorMessage: result.error,
          isSimulated: result.simulated,
        });
      }),
    );
  }

  return {
    totalCandidates: pairs.length,
    sent,
    simulated,
    failed,
    skipped: pairs.length - eligible.length,
    errors,
    simulatedMode: simulated > 0 && sent === 0,
  };
}

export function dispatchUrl(target: {
  kind: NotificationKind;
  id: string;
  slug?: string;
}): string {
  switch (target.kind) {
    case "weather_alert":
      return `${env.appUrl}/panel/clima#alertas`;
    case "meeting":
      return `${env.appUrl}/panel/reuniones/${target.id}`;
    case "educational":
      return `${env.appUrl}/panel/biblioteca/${target.slug ?? target.id}`;
    case "announcement":
    default:
      return `${env.appUrl}/panel/anuncios/${target.id}`;
  }
}
