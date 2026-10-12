import { z } from "zod";
import { isRealDate } from "@/lib/validation";

export const PROFILE_KEY = "psycare:profile:v1";
export const NAME_MAX = 60;
/** Data mais antiga aceita (AAAA-MM-DD). */
export const MIN_BIRTH_DATE = "1900-01-01";

export interface Profile {
  /** Como a pessoa quer ser chamada. Vazio = o app só diz "Olá!". Pode ser fictício na demonstração. */
  name: string;
  /** Data de nascimento (AAAA-MM-DD). Opcional. */
  birthDate?: string;
}

export const EMPTY_PROFILE: Profile = { name: "" };

/** Aceita o que vem de um formulário (texto) e entrega um Profile limpo. Os dois campos são opcionais. */
export function profileSchema(todayISO: string) {
  return z.object({
    name: z.string().trim().max(NAME_MAX, `O nome passa de ${NAME_MAX} caracteres`),
    birthDate: z
      .string()
      .trim()
      .transform((value, ctx) => {
        if (value === "") return undefined;
        if (!isRealDate(value)) {
          ctx.addIssue({ code: "custom", message: "Escolha uma data válida" });
          return z.NEVER;
        }
        if (value > todayISO) {
          ctx.addIssue({ code: "custom", message: "A data não pode ser no futuro" });
          return z.NEVER;
        }
        if (value < MIN_BIRTH_DATE) {
          ctx.addIssue({ code: "custom", message: "Escolha uma data a partir de 1900" });
          return z.NEVER;
        }
        return value;
      }),
  });
}

export type ProfileResult =
  { ok: true; profile: Profile } | { ok: false; errors: { name?: string; birthDate?: string } };

export function parseProfile(input: { name: string; birthDate: string }, todayISO: string): ProfileResult {
  const parsed = profileSchema(todayISO).safeParse(input);
  if (!parsed.success) {
    const errors: { name?: string; birthDate?: string } = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] === "birthDate" ? "birthDate" : "name";
      errors[field] ??= issue.message;
    }
    return { ok: false, errors };
  }
  const { name, birthDate } = parsed.data;
  return { ok: true, profile: birthDate === undefined ? { name } : { name, birthDate } };
}
