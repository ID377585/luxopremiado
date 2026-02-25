import { z } from "zod";

export const paymentSchema = z.object({
  orderId: z.string().uuid(),
  provider: z.enum(["asaas", "mercadopago", "pagarme", "stripe"]),
  method: z.enum(["pix", "card"]).default("pix"),
  botTrap: z.string().trim().optional(),
  turnstileToken: z.string().trim().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
