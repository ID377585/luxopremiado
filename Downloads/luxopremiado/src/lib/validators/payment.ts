import { z } from "zod";

export const paymentSchema = z.object({
  orderId: z.string().uuid(),
  provider: z.enum(["asaas", "mercadopago", "pagarme", "stripe", "manual"]),
  method: z.enum(["pix", "card"]).default("pix"),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
