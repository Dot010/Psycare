"use client";

import { useState } from "react";
import { formatDateBR } from "@/lib/format";
import { mockUser } from "@/mocks/user";
import type { Agendamento } from "@/features/appointments/types";
import { createAppointmentSchema, type CreateAppointmentInput } from "@/features/appointments/types";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Agendamento[]>(mockUser.agendamentos || []);

  const addAppointment = (input: CreateAppointmentInput) => {
    const parsed = createAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message || "Dados inválidos" };
    }

    const novoAgendamento: Agendamento = {
      id: crypto.randomUUID(),
      profissional: parsed.data.profissional,
      data: formatDateBR(parsed.data.data),
      hora: parsed.data.hora,
      status: "pendente",
      tipo: parsed.data.tipo,
    };

    setAppointments((prev) => [novoAgendamento, ...prev]);
    return { success: true as const };
  };

  return {
    appointments,
    addAppointment,
  };
}
