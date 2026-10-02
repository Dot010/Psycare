"use client";

import type { Agendamento } from "@/features/appointments/types";
import { createAppointmentSchema, type CreateAppointmentInput } from "@/features/appointments/types";
import { upsertById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";

export const APPOINTMENTS_KEY = "psycare:appointments:v1";

export function useAppointments() {
  const [appointments, setAppointments] = useLocalStorage<Agendamento[]>(
    APPOINTMENTS_KEY,
    mockUser.agendamentos,
  );

  /** Cria uma consulta nova ou, se `id` for informado, remarca/edita a existente (volta a "pendente"). */
  const saveAppointment = (input: CreateAppointmentInput, id?: string) => {
    const parsed = createAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message || "Dados inválidos" };
    }

    const saved: Agendamento = {
      id: id ?? crypto.randomUUID(),
      profissional: parsed.data.profissional,
      data: parsed.data.data,
      hora: parsed.data.hora,
      status: "pendente",
      tipo: parsed.data.tipo,
    };

    setAppointments((current) => upsertById(current, saved));
    return { success: true as const };
  };

  const cancelAppointment = (id: string) =>
    setAppointments((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "cancelado" as const } : item)),
    );

  return { appointments, saveAppointment, cancelAppointment };
}
