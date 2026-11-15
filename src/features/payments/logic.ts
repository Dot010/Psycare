import { PROFESSIONALS, type Professional } from "@/features/pro/identity";
import type { Agendamento } from "@/features/appointments/types";
import type { SessionClosing } from "@/features/pro/types";
import type { Charge } from "./types";

export interface ProfessionalCharges {
  professional: Professional;
  /** Da mais recente para a mais antiga. */
  charges: Charge[];
  /** Soma do que ainda não foi pago a este profissional. */
  open: number;
}

/** Agrupa por profissional: cada pagamento é individual, então cada um tem a sua lista e o seu total. */
export function groupByProfessional(charges: Charge[]): ProfessionalCharges[] {
  return PROFESSIONALS.map((professional) => {
    const own = charges
      .filter((c) => c.professionalId === professional.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const open = own.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
    return { professional, charges: own, open };
  }).filter((group) => group.charges.length > 0);
}

export function totalOpen(groups: ProfessionalCharges[]): number {
  return groups.reduce((sum, g) => sum + g.open, 0);
}

/**
 * O que o profissional lançou ao encerrar uma consulta marcada pelo paciente vira cobrança aqui,
 * com o profissional certo. Quando ele marca como paga, aparece paga para o paciente também.
 */
export function chargesFromClosings(closings: SessionClosing[], appointments: Agendamento[]): Charge[] {
  return closings.flatMap((closing) => {
    if (closing.charge <= 0 || !closing.sessionId.startsWith("ag_")) return [];
    const appointment = appointments.find((a) => `ag_${a.id}` === closing.sessionId);
    const professional = PROFESSIONALS.find((p) => p.name === appointment?.profissional);
    if (!professional) return [];
    const missed = closing.outcome === "faltou";
    return [
      {
        id: `fech-${closing.sessionId}`,
        professionalId: professional.id,
        description: missed
          ? "Falta cobrada"
          : professional.specialty === "psychiatrist"
            ? "Consulta de psiquiatria"
            : "Sessão de psicoterapia",
        amount: closing.charge,
        date: closing.date,
        status: closing.paid ? "paid" : "pending",
      },
    ];
  });
}
