import "server-only";
import { env, isWhatsAppConfigured } from "@/lib/env";
import { normalizePhone } from "@/lib/utils";
import { verifyWebhookSignature } from "@/lib/whatsapp/signature";

export interface WhatsAppSendResult {
  ok: boolean;
  simulated: boolean;
  messageId: string | null;
  status: "sent" | "simulated" | "failed";
  error: string | null;
  httpStatus: number | null;
}

export interface TemplateParameter {
  type: "text";
  text: string;
}

interface MetaErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
}

async function postMessage(
  payload: Record<string, unknown>,
): Promise<WhatsAppSendResult> {
  if (!isWhatsAppConfigured) {
    if (env.whatsapp.demoMode) {
      return {
        ok: true,
        simulated: true,
        messageId: null,
        status: "simulated",
        error: null,
        httpStatus: null,
      };
    }
    return {
      ok: false,
      simulated: false,
      messageId: null,
      status: "failed",
      error:
        "WhatsApp Cloud API no está configurado. Defina WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID.",
      httpStatus: null,
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${env.whatsapp.apiVersion}/${env.whatsapp.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.whatsapp.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      },
    );

    const body = (await response.json().catch(() => ({}))) as {
      messages?: { id: string }[];
    } & MetaErrorBody;

    if (!response.ok) {
      return {
        ok: false,
        simulated: false,
        messageId: null,
        status: "failed",
        error:
          body.error?.message ??
          `Meta respondió con estado ${response.status}.`,
        httpStatus: response.status,
      };
    }

    return {
      ok: true,
      simulated: false,
      messageId: body.messages?.[0]?.id ?? null,
      status: "sent",
      error: null,
      httpStatus: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      simulated: false,
      messageId: null,
      status: "failed",
      error:
        error instanceof Error && error.name === "TimeoutError"
          ? "La solicitud a Meta excedió el tiempo de espera."
          : "No se pudo conectar con la API de WhatsApp.",
      httpStatus: null,
    };
  }
}

/** Envía una plantilla aprobada (mensajes iniciados por la plataforma). */
export async function sendTemplateMessage(input: {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters: string[];
}): Promise<WhatsAppSendResult> {
  const to = normalizePhone(input.to);
  return postMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: input.templateName,
      language: { code: input.languageCode ?? env.whatsapp.templateLanguage },
      components: [
        {
          type: "body",
          parameters: input.parameters.map((text) => ({
            type: "text",
            text,
          })),
        },
      ],
    },
  });
}

/**
 * Envía texto libre. Solo válido dentro de la ventana de servicio al cliente
 * de 24 horas iniciada por el usuario. Para mensajes proactivos use plantillas.
 */
export async function sendTextMessage(input: {
  to: string;
  body: string;
}): Promise<WhatsAppSendResult> {
  const to = normalizePhone(input.to);
  return postMessage({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: input.body.slice(0, 4096) },
  });
}

export { verifyWebhookSignature };
