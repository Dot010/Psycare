import { LIVE_PATIENT_ID, patientById } from "@/features/pro/data";
import type { Charge } from "./types";

/** Valor de cada atendimento: o mesmo que o financeiro do profissional usa para este paciente. */
const FEE = patientById(LIVE_PATIENT_ID)?.fee ?? 180;

/** Cobranças de exemplo. Cada profissional recebe só as suas. */
export const CHARGES: Charge[] = [
  {
    id: "c1",
    professionalId: "pro_psi_01",
    description: "Sessão de psicoterapia",
    date: "2026-09-08",
    amount: FEE,
    status: "paid",
  },
  {
    id: "c2",
    professionalId: "pro_psi_01",
    description: "Sessão de psicoterapia",
    date: "2026-09-22",
    amount: FEE,
    status: "paid",
  },
  {
    id: "c3",
    professionalId: "pro_psi_01",
    description: "Sessão de psicoterapia",
    date: "2026-10-06",
    amount: FEE,
    status: "pending",
  },
  {
    id: "c4",
    professionalId: "pro_med_01",
    description: "Consulta de psiquiatria",
    date: "2026-09-15",
    amount: FEE,
    status: "paid",
  },
];
