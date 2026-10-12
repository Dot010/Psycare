import { PROFESSIONALS, type Professional } from "@/features/pro/identity";
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
