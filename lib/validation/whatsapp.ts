import { z } from "zod";

export const webhookMessageSchema = z.object({
  from: z.string().min(5),
  id: z.string().min(1),
  timestamp: z.string(),
  type: z.string(),
  text: z.object({ body: z.string() }).optional(),
  button: z.object({ text: z.string().optional(), payload: z.string().optional() }).optional(),
  interactive: z
    .object({
      type: z.string().optional(),
      button_reply: z
        .object({ id: z.string(), title: z.string() })
        .optional(),
      list_reply: z.object({ id: z.string(), title: z.string() }).optional(),
    })
    .optional(),
  contacts: z
    .array(z.object({ profile: z.object({ name: z.string().optional() }).optional() }))
    .optional(),
});

export const webhookStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  timestamp: z.string(),
  recipient_id: z.string().optional(),
  errors: z
    .array(
      z.object({
        code: z.number().optional(),
        title: z.string().optional(),
        message: z.string().optional(),
      }),
    )
    .optional(),
});

export const webhookPayloadSchema = z.object({
  object: z.string(),
  entry: z
    .array(
      z.object({
        id: z.string(),
        changes: z.array(
          z.object({
            field: z.string(),
            value: z.object({
              messaging_product: z.string().optional(),
              metadata: z
                .object({
                  display_phone_number: z.string().optional(),
                  phone_number_id: z.string().optional(),
                })
                .optional(),
              contacts: z
                .array(
                  z.object({
                    profile: z
                      .object({ name: z.string().optional() })
                      .optional(),
                    wa_id: z.string().optional(),
                  }),
                )
                .optional(),
              messages: z.array(webhookMessageSchema).optional(),
              statuses: z.array(webhookStatusSchema).optional(),
            }),
          }),
        ),
      }),
    )
    .default([]),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type WebhookMessage = z.infer<typeof webhookMessageSchema>;

export const sendTemplateSchema = z.object({
  to: z.string().min(7),
  templateName: z.string().min(1),
  languageCode: z.string().default("es"),
  parameters: z.array(z.string()).max(10),
});
