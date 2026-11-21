import { z } from "zod";

export const weatherQuerySchema = z.object({
  municipalityId: z.string().trim().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  name: z.string().trim().max(100).optional(),
});

export const notificationResponseSchema = z.object({
  messaging_product: z.string().optional(),
  contacts: z.array(z.unknown()).optional(),
  messages: z
    .array(
      z.object({
        id: z.string(),
        message_status: z.string().optional(),
      }),
    )
    .optional(),
});
