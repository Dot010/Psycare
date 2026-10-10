import type { ExamStep } from "./types";

export const EXAM_CATALOG = ["TSH", "Glicemia", "Vitamina D", "Lítio sérico", "Função hepática", "Hemograma"];

export const STEP_LABEL: Record<ExamStep, string> = {
  1: "Pedido",
  2: "Coletado",
  3: "Resultado chegou",
};

/** Texto do botão que leva o exame para a próxima etapa. `null` quando já terminou. */
export function advanceLabel(step: ExamStep): string | null {
  if (step === 1) return "Marcar como coletado";
  if (step === 2) return "Registrar resultado";
  return null;
}

export function nextStep(step: ExamStep): ExamStep {
  return step === 1 ? 2 : 3;
}

/** Nova validade ao renovar: conta a partir de hoje (AAAA-MM-DD). */
export function renewedUntil(today: string, days = 90): string {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
