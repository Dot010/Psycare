"use client";

import { useState } from "react";
import { mockUser } from "@/data/mockData";
import type { Agendamento } from "@/types/domain";
import { createAppointmentSchema, type CreateAppointmentInput } from "@/features/appointments/types";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Agendamento[]>(mockUser.agendamentos || []);

  const addAppointment = (input: CreateAppointmentInput) => {
    const parsed = createAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message || "Dados inválidos" };
    }

    const novoAgendamento: Agendamento = {
      id: Date.now().toString(),
      profissional: parsed.data.profissional,
      data: parsed.data.data,
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
