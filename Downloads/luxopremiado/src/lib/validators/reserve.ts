import { z } from "zod";

export const reserveSchema =
  z
    .object({
      numbers: z.array(z.number().int().min(0).max(999_999_999_999)).min(1).max(200).optional(),
      qty: z.number().int().positive().max(200).optional(),
      affiliateCode: z
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9_-]{3,40}$/)
        .optional(),
      botTrap: z.string().trim().optional(),
      turnstileToken: z.string().trim().optional(),
    })
    .refine((value) => !(value.numbers && value.qty), {
      message: "Informe apenas numbers ou qty.",
    })
    .refine((value) => Boolean(value.numbers || value.qty), {
      message: "Informe numbers ou qty.",
    });

export type ReserveInput = z.infer<typeof reserveSchema>;
