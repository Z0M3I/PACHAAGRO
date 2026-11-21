import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "@/lib/whatsapp/signature";
import { interpretWhatsAppCommand } from "@/services/whatsapp/commands";
import { webhookPayloadSchema } from "@/lib/validation/whatsapp";

const secret = "test-app-secret";
const body = JSON.stringify({ object: "whatsapp_business_account", entry: [] });
const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

describe("firma del webhook de WhatsApp", () => {
  it("acepta una firma válida", () => {
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
  });

  it("rechaza una firma alterada", () => {
    expect(
      verifyWebhookSignature(`${body} `, signature, secret),
    ).toBe(false);
  });

  it("rechaza firmas ausentes o secretos vacíos", () => {
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyWebhookSignature(body, signature, null)).toBe(false);
  });
});

describe("comandos del bot", () => {
  it("interpreta comandos con mayúsculas y tildes", () => {
    expect(interpretWhatsAppCommand("clima Punata").kind).toBe("weather");
    expect(interpretWhatsAppCommand("PRONÓSTICO").kind).toBe("weather");
    expect(interpretWhatsAppCommand("  alertas ").kind).toBe("alerts");
    expect(interpretWhatsAppCommand("BÁJATE").kind).toBe("unknown");
    expect(interpretWhatsAppCommand("BAJA").kind).toBe("opt_out");
  });

  it("extrae el municipio del comando de clima", () => {
    const command = interpretWhatsAppCommand("CLIMA San Ignacio de Moxos");
    expect(command.kind).toBe("weather");
    expect(command.argument).toBe("SAN IGNACIO DE MOXOS");
  });

  it("trata saludos como ayuda", () => {
    expect(interpretWhatsAppCommand("Hola").kind).toBe("help");
    expect(interpretWhatsAppCommand("MENU").kind).toBe("help");
  });
});

describe("payload del webhook", () => {
  it("acepta un mensaje de texto y estado válidos", () => {
    const parsed = webhookPayloadSchema.safeParse({
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { phone_number_id: "123" },
                messages: [
                  {
                    from: "59171234567",
                    id: "wamid.123",
                    timestamp: "1700000000",
                    type: "text",
                    text: { body: "CLIMA" },
                  },
                ],
                statuses: [
                  {
                    id: "wamid.123",
                    status: "delivered",
                    timestamp: "1700000001",
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rechaza payloads sin objeto de WhatsApp", () => {
    expect(webhookPayloadSchema.safeParse({}).success).toBe(false);
  });
});
