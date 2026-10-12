import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .max(254, "Email muito longo")
    .email("Email inválido")
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(128, "Senha muito longa"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome muito longo")
      .transform((n) => n.trim()),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .max(254, "Email muito longo")
      .email("Email inválido")
      .transform((e) => e.toLowerCase().trim()),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(6, "Senha deve ter no mínimo 6 caracteres")
      .max(128, "Senha muito longa"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória").max(128, "Senha muito longa"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não correspondem",
    path: ["confirmPassword"],
  });

export const demoProfiles = ["patient", "psychologist", "psychiatrist"] as const;
export const demoProfileSchema = z.enum(demoProfiles);
export type DemoProfile = (typeof demoProfiles)[number];
