import { z } from "zod";
import { isClockTime, isRealDate, tooLong } from "@/lib/validation";

const appointmentTypes = ["online", "presencial"] as const;
export type AppointmentType = (typeof appointmentTypes)[number];

export type Agendamento = {
  id: string;
  profissional: string;
  data: string;
  hora: string;
  status: "pendente" | "confirmado" | "cancelado";
  tipo: AppointmentType;
  /** O que a pessoa quer lembrar ou levar para a sessão. */
  observacao?: string;
};

export const PROFISSIONAL_MAX = 80;

export const createAppointmentSchema = z.object({
  profissional: z
    .string()
    .trim()
    .min(2, "Informe o profissional")
    .max(PROFISSIONAL_MAX, tooLong(PROFISSIONAL_MAX)),
  data: z.string().min(1, "Informe a data").refine(isRealDate, "Escolha uma data válida"),
  hora: z.string().min(1, "Informe o horário").refine(isClockTime, "Escolha um horário válido"),
  tipo: z.enum(appointmentTypes),
  observacao: z.string().trim().max(200, "A observação passa de 200 caracteres").optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
