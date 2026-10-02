export type PhaseKind = "inhale" | "hold-full" | "exhale" | "hold-empty";

export interface Phase {
  kind: PhaseKind;
  label: string;
  seconds: number;
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
}

/** Escala do blob: vazio (pulmão cheio de ar = maior). */
export const SCALE_EMPTY = 0.7;
export const SCALE_FULL = 1.08;

export function scaleForPhase(kind: PhaseKind): number {
  return kind === "inhale" || kind === "hold-full" ? SCALE_FULL : SCALE_EMPTY;
}

const inhale = (seconds: number): Phase => ({ kind: "inhale", label: "Inspire", seconds });
const holdFull = (seconds: number): Phase => ({ kind: "hold-full", label: "Segure", seconds });
const exhale = (seconds: number): Phase => ({ kind: "exhale", label: "Expire", seconds });
const holdEmpty = (seconds: number): Phase => ({ kind: "hold-empty", label: "Segure", seconds });

export const TECHNIQUES: Technique[] = [
  {
    id: "calm",
    name: "Calmante 4-6",
    description: "Expirar mais longo que inspirar ajuda o corpo a desacelerar. Bom para começar.",
    phases: [inhale(4), exhale(6)],
  },
  {
    id: "box",
    name: "Respiração em caixa",
    description: "Quatro tempos iguais. Ajuda a focar quando a mente está acelerada.",
    phases: [inhale(4), holdFull(4), exhale(4), holdEmpty(4)],
  },
  {
    id: "478",
    name: "Técnica 4-7-8",
    description: "Pausa longa e expiração lenta, indicada para relaxar antes de dormir.",
    phases: [inhale(4), holdFull(7), exhale(8)],
  },
];

export const SESSION_MINUTES = [1, 3, 5] as const;

export function cycleDuration(technique: Technique): number {
  return technique.phases.reduce((sum, phase) => sum + phase.seconds, 0);
}

export interface PhasePosition {
  index: number;
  phase: Phase;
  /** Segundos que faltam para a fase acabar (arredondado para cima, mínimo 1). */
  remaining: number;
  /** Número do ciclo, começando em 1. */
  cycle: number;
}

/** Em que fase da técnica estamos, `elapsed` segundos depois do início. */
export function phaseAt(technique: Technique, elapsed: number): PhasePosition {
  const total = cycleDuration(technique);
  const safe = Math.max(0, elapsed);
  const cycle = Math.floor(safe / total) + 1;
  const inCycle = safe % total;

  let start = 0;
  for (let index = 0; index < technique.phases.length; index++) {
    const phase = technique.phases[index];
    const end = start + phase.seconds;
    if (inCycle < end) {
      return { index, phase, remaining: Math.max(1, Math.ceil(end - inCycle)), cycle };
    }
    start = end;
  }

  // Só chega aqui por erro de ponto flutuante no último instante do ciclo.
  const last = technique.phases.length - 1;
  return { index: last, phase: technique.phases[last], remaining: 1, cycle };
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
