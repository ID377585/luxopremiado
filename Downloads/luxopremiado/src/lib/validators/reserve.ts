import { z } from "zod";

export const reserveSchema =
  z
    .object({
      numbers: z.array(z.number().int().positive()).min(1).max(200).optional(),
      qty: z.number().int().positive().max(200).optional(),
    })
    .refine((value) => !(value.numbers && value.qty), {
      message: "Informe apenas numbers ou qty.",
    })
    .refine((value) => Boolean(value.numbers || value.qty), {
      message: "Informe numbers ou qty.",
    });

export type ReserveInput = z.infer<typeof reserveSchema>;
