import { z } from "zod";

export const PROFILE_KEY = "psycare:profile:v1";
export const NAME_MAX = 60;
export const MIN_BIRTH_YEAR = 1900;

export interface Profile {
  /** Como a pessoa quer ser chamada. Vazio = o app só diz "Olá!". Pode ser fictício na demonstração. */
  name: string;
  /** Ano de nascimento (4 dígitos). Opcional. */
  birthYear?: number;
}

export const EMPTY_PROFILE: Profile = { name: "" };

/** Aceita o que vem de um formulário (texto) e entrega um Profile limpo. Os dois campos são opcionais. */
export function profileSchema(currentYear: number) {
  return z.object({
    name: z.string().trim().max(NAME_MAX, `O nome passa de ${NAME_MAX} caracteres`),
    birthYear: z
      .string()
      .trim()
      .transform((value, ctx) => {
        if (value === "") return undefined;
        if (!/^\d{4}$/.test(value)) {
          ctx.addIssue({ code: "custom", message: "Use 4 dígitos, por exemplo 1990" });
          return z.NEVER;
        }
        const year = Number(value);
        if (year < MIN_BIRTH_YEAR || year > currentYear) {
          ctx.addIssue({
            code: "custom",
            message: `Escolha um ano entre ${MIN_BIRTH_YEAR} e ${currentYear}`,
          });
          return z.NEVER;
        }
        return year;
      }),
  });
}

export type ProfileResult =
  { ok: true; profile: Profile } | { ok: false; errors: { name?: string; birthYear?: string } };

export function parseProfile(input: { name: string; birthYear: string }, currentYear: number): ProfileResult {
  const parsed = profileSchema(currentYear).safeParse(input);
  if (!parsed.success) {
    const errors: { name?: string; birthYear?: string } = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] === "birthYear" ? "birthYear" : "name";
      errors[field] ??= issue.message;
    }
    return { ok: false, errors };
  }
  const { name, birthYear } = parsed.data;
  return { ok: true, profile: birthYear === undefined ? { name } : { name, birthYear } };
}
