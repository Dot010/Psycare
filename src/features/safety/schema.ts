import { z } from "zod";
import { tooLong } from "@/lib/validation";
import { isValidPhone } from "./logic";

export const CONTACT_NAME_MAX = 60;
export const CONTACT_ROLE_MAX = 40;

/** Pessoa de confiança do plano de segurança. */
export const contactSchema = z.object({
  name: z
    .string()
    .transform((value) => value.replace(/\s+/g, " ").trim())
    .pipe(z.string().min(2, "Escreva o nome.").max(CONTACT_NAME_MAX, tooLong(CONTACT_NAME_MAX))),
  role: z
    .string()
    .transform((value) => value.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(CONTACT_ROLE_MAX, tooLong(CONTACT_ROLE_MAX))),
  phone: z.string().refine(isValidPhone, "Confira o telefone, com DDD."),
});
