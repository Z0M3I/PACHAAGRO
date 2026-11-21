import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/env";
import { getDemoStore } from "@/lib/demo-store";
import type {
  NotificationLog,
  NotificationStatus,
  WhatsAppMessage,
} from "@/types/domain";
import type { WhatsAppSendResult } from "@/services/whatsapp/meta-client";
import {
  mapLog,
  mapMessage,
  type LogRow,
  type MessageRow,
} from "@/services/mappers";

export interface OutboundMessageInput {
  profileId: string | null;
  phone: string;
  body: string;
  templateName: string | null;
  messageType: "text" | "template";
}

export interface NotificationLogInput {
  profileId: string | null;
  channel: NotificationLog["channel"];
  notificationType: NotificationLog["notificationType"];
  referenceId: string | null;
  recipientPhone: string;
  status: NotificationStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  isSimulated: boolean;
}

export async function listWhatsAppMessages(limit = 100): Promise<WhatsAppMessage[]> {
  if (isDemoMode) {
    return [...getDemoStore().whatsappMessages]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as MessageRow[]).map(mapMessage);
}

export async function recordOutboundMessage(
  input: OutboundMessageInput,
  result: WhatsAppSendResult,
): Promise<void> {
  const status: NotificationStatus =
    result.status === "sent"
      ? "sent"
      : result.status === "simulated"
        ? "simulated"
        : "failed";

  if (isDemoMode) {
    getDemoStore().whatsappMessages.unshift({
      id: randomUUID(),
      profileId: input.profileId,
      waMessageId: result.messageId,
      direction: "outbound",
      phone: input.phone,
      messageType: input.messageType,
      body: input.body,
      templateName: input.templateName,
      status,
      errorMessage: result.error,
      isSimulated: result.simulated,
      createdAt: new Date().toISOString(),
    });
    return;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return;
  await admin.from("whatsapp_messages").insert({
    profile_id: input.profileId,
    wa_message_id: result.messageId,
    direction: "outbound",
    phone: input.phone,
    message_type: input.messageType,
    body: input.body.slice(0, 8000),
    template_name: input.templateName,
    status,
    error_message: result.error,
    is_simulated: result.simulated,
  });
}

export async function isMessageProcessed(waMessageId: string): Promise<boolean> {
  if (isDemoMode) {
    return getDemoStore().whatsappMessages.some(
      (item) => item.waMessageId === waMessageId,
    );
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return false;
  const { data } = await admin
    .from("whatsapp_messages")
    .select("id")
    .eq("wa_message_id", waMessageId)
    .maybeSingle();
  return Boolean(data);
}

export async function recordInboundMessage(input: {
  profileId: string | null;
  phone: string;
  waMessageId: string;
  body: string;
  messageType: string;
}): Promise<void> {
  if (isDemoMode) {
    getDemoStore().whatsappMessages.unshift({
      id: randomUUID(),
      profileId: input.profileId,
      waMessageId: input.waMessageId,
      direction: "inbound",
      phone: input.phone,
      messageType: input.messageType,
      body: input.body.slice(0, 8000),
      templateName: null,
      status: "delivered",
      errorMessage: null,
      isSimulated: true,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  await admin.from("whatsapp_messages").insert({
    profile_id: input.profileId,
    wa_message_id: input.waMessageId,
    direction: "inbound",
    phone: input.phone,
    message_type: input.messageType,
    body: input.body.slice(0, 8000),
    status: "delivered",
    is_simulated: false,
  });
}

export async function updateMessageStatus(
  waMessageId: string,
  status: string,
  errorMessage: string | null,
): Promise<void> {
  const allowed = ["sent", "delivered", "read", "failed"];
  if (!allowed.includes(status)) return;

  if (isDemoMode) {
    const message = getDemoStore().whatsappMessages.find(
      (item) => item.waMessageId === waMessageId,
    );
    if (message) {
      message.status = status as NotificationStatus;
      message.errorMessage = errorMessage;
    }
    return;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return;
  await admin
    .from("whatsapp_messages")
    .update({ status, error_message: errorMessage })
    .eq("wa_message_id", waMessageId);
  await admin
    .from("notification_logs")
    .update({ status })
    .eq("provider_message_id", waMessageId);
}

export async function recordNotificationLog(
  input: NotificationLogInput,
): Promise<void> {
  if (isDemoMode) {
    const profile = getDemoStore().profiles.find(
      (item) => item.id === input.profileId,
    );
    getDemoStore().notificationLogs.unshift({
      id: randomUUID(),
      profileId: input.profileId,
      channel: input.channel,
      notificationType: input.notificationType,
      referenceId: input.referenceId,
      recipientName: profile?.fullName ?? null,
      recipientPhone: input.recipientPhone,
      status: input.status,
      providerMessageId: input.providerMessageId,
      errorMessage: input.errorMessage,
      isSimulated: input.isSimulated,
      createdAt: new Date().toISOString(),
    });
    return;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return;
  await admin.from("notification_logs").insert({
    profile_id: input.profileId,
    channel: input.channel,
    notification_type: input.notificationType,
    reference_id: input.referenceId,
    recipient_phone: input.recipientPhone,
    status: input.status,
    provider_message_id: input.providerMessageId,
    error_message: input.errorMessage,
    is_simulated: input.isSimulated,
  });
}

export async function listUserNotificationLogs(
  profileId: string,
  limit = 30,
): Promise<NotificationLog[]> {
  if (isDemoMode) {
    return getDemoStore()
      .notificationLogs.filter((item) => item.profileId === profileId)
      .slice(0, limit);
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("notification_logs")
    .select("*, profiles(full_name)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as LogRow[]).map(mapLog);
}
