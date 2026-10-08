import { z } from "zod";

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

export const createAppointmentSchema = z.object({
  profissional: z.string().min(2, "Informe o profissional").max(80),
  data: z.string().min(1, "Informe a data"),
  hora: z.string().min(1, "Informe o horário"),
  tipo: z.enum(appointmentTypes),
  observacao: z.string().trim().max(200, "A observação passa de 200 caracteres").optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
