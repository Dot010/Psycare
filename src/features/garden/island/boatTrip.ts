import { cycleDuration, phaseAt, TECHNIQUES, type Technique } from "@/features/breathing/techniques";

/** A travessia usa a respiração calmante (4 s inspirando, 6 s soltando). */
export const TRIP_TECHNIQUE: Technique = TECHNIQUES[0];
export const TRIP_CYCLES = [3, 5, 8] as const;

export function tripSeconds(cycles: number, technique: Technique = TRIP_TECHNIQUE): number {
  return cycles * cycleDuration(technique);
}

/**
 * Como está a respiração `elapsed` segundos depois de sair do cais.
 * `fill`: o ar no peito (0 vazio, 1 cheio): enche a vela.
 * `travel`: quanto do caminho o barco já andou (0 no cais, 1 na ilhota). Ele só anda soltando o ar.
 */
export function breathAt(
  elapsed: number,
  cycles: number,
  technique: Technique = TRIP_TECHNIQUE,
): { fill: number; travel: number } {
  const total = cycleDuration(technique);
  const t = Math.min(Math.max(0, elapsed), cycles * total);
  const done = Math.min(cycles, Math.floor(t / total));
  if (done >= cycles) return { fill: 0, travel: 1 };
  let inCycle = t - done * total;
  let fill = 0;
  let moved = 0;
  const exhaleTotal = technique.phases.filter((p) => p.kind === "exhale").reduce((s, p) => s + p.seconds, 0);
  for (const phase of technique.phases) {
    const k = Math.min(1, inCycle / phase.seconds);
    if (phase.kind === "inhale") fill = k;
    else if (phase.kind === "hold-full") fill = 1;
    else if (phase.kind === "exhale") {
      fill = 1 - k;
      moved += k * phase.seconds;
    } else fill = 0;
    if (inCycle <= phase.seconds) break;
    inCycle -= phase.seconds;
  }
  return { fill, travel: (done + (exhaleTotal ? moved / exhaleTotal : 0)) / cycles };
}

/** O que mostrar na tela: a fase, os segundos que faltam e o ciclo. */
export function tripStatus(elapsed: number, cycles: number, technique: Technique = TRIP_TECHNIQUE) {
  if (elapsed >= tripSeconds(cycles, technique)) return null;
  const position = phaseAt(technique, elapsed);
  return {
    label: position.phase.label,
    kind: position.phase.kind,
    remaining: position.remaining,
    cycle: position.cycle,
  };
}
