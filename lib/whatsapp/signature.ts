import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifica X-Hub-Signature-256 usando el App Secret de Meta.
 * Función pura para poder probarla sin variables de entorno.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string | null,
): boolean {
  if (!appSecret || !signatureHeader) return false;
  const expected = `sha256=${createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex")}`;

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signatureHeader, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
