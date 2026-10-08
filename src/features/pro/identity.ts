import type { Specialty } from "@/lib/session";

export interface Professional {
  id: string;
  name: string;
  specialty: Specialty;
  /** Registro profissional fictício, só para a demonstração. */
  register: string;
}

export const PROFESSIONALS: Professional[] = [
  {
    id: "pro_psi_01",
    name: "Dra. Helena Prado",
    specialty: "psychologist",
    register: "CRP 00/00000 (exemplo)",
  },
  { id: "pro_med_01", name: "Dr. Rafael Nunes", specialty: "psychiatrist", register: "CRM 00000 (exemplo)" },
];

export const SPECIALTY_LABEL: Record<Specialty, string> = {
  psychologist: "Psicologia",
  psychiatrist: "Psiquiatria",
};

export function professionalFor(userId: string | undefined): Professional {
  return PROFESSIONALS.find((p) => p.id === userId) ?? PROFESSIONALS[0];
}
