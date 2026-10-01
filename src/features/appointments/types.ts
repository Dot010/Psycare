import { z } from "zod";

export const createAppointmentSchema = z.object({
  profissional: z.string().min(2, "Informe o profissional").max(80),
  data: z.string().min(1, "Informe a data"),
  hora: z.string().min(1, "Informe o horário"),
  tipo: z.enum(["online", "presencial"]),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
