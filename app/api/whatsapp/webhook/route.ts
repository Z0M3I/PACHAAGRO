import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { verifyWebhookSignature } from "@/lib/whatsapp/signature";
import { processWhatsAppWebhook } from "@/services/whatsapp/webhook";
import { webhookPayloadSchema } from "@/lib/validation/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Verificación del webhook de Meta.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 */
export async function GET(request: NextRequest) {
  if (!env.whatsapp.verifyToken) {
    return NextResponse.json(
      {
        error:
          "El webhook no está configurado. Defina WHATSAPP_VERIFY_TOKEN.",
      },
      { status: 503 },
    );
  }

  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token && safeEqual(token, env.whatsapp.verifyToken)) {
    return new NextResponse(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Verificación fallida." }, { status: 403 });
}

export async function POST(request: NextRequest) {
  if (!env.whatsapp.appSecret) {
    return NextResponse.json(
      {
        error:
          "El webhook no está configurado. Defina WHATSAPP_APP_SECRET para validar la firma.",
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyWebhookSignature(rawBody, signature, env.whatsapp.appSecret)) {
    return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = webhookPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload no reconocido." }, { status: 400 });
  }

  try {
    const result = await processWhatsAppWebhook(parsed.data);
    return NextResponse.json({ received: true, ...result }, { status: 200 });
  } catch {
    // Se responde 200 para evitar reintentos infinitos de Meta; el error
    // queda registrado en los logs del servidor sin datos sensibles.
    console.error("Error procesando webhook de WhatsApp");
    return NextResponse.json({ received: true, error: "processed_with_errors" });
  }
}
