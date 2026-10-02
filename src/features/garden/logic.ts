import { daysBetween } from "@/lib/dates";
import type { PlantKind, PlantState, WaterDrop, WaterSource } from "@/features/garden/types";

/** Quantas gotas cada planta precisa para aparecer e para crescer por completo. */
const PLANTS: { kind: PlantKind; appearsAt: number; fullAt: number }[] = [
  { kind: "sunflower", appearsAt: 0, fullAt: 20 },
  { kind: "daisy", appearsAt: 6, fullAt: 26 },
  { kind: "tulip", appearsAt: 14, fullAt: 34 },
  { kind: "lavender", appearsAt: 24, fullAt: 44 },
];

export const MAX_DROPS_KEPT = 400;

/** Uma gota por ação por dia: o mesmo hábito, ou o diário, o check-in e a respiração, uma vez ao dia. */
export function dropId(source: WaterSource, date: string, ref?: string): string {
  return [source, date, ref].filter(Boolean).join(":");
}

/** Devolve a lista com a gota nova, ou a mesma lista se ela já existia. */
export function addDrop(drops: WaterDrop[], drop: WaterDrop): WaterDrop[] {
  if (drops.some((item) => item.id === drop.id)) return drops;
  return [...drops, drop].slice(-MAX_DROPS_KEPT);
}

/** O jardim só cresce: o total de gotas nunca diminui por desmarcar um hábito. */
export function gardenPlants(total: number): PlantState[] {
  return PLANTS.filter((plant) => total >= plant.appearsAt).map((plant) => ({
    kind: plant.kind,
    growth: Math.min(1, Math.max(0.3, (total - plant.appearsAt) / (plant.fullAt - plant.appearsAt))),
  }));
}

/** Quantas gotas faltam para a próxima planta aparecer (ou null se já estão todas). */
export function dropsToNextPlant(total: number): number | null {
  const next = PLANTS.find((plant) => plant.appearsAt > total);
  return next ? next.appearsAt - total : null;
}

/** Dias (de `today` para trás) com ao menos uma gota, em ordem do mais antigo ao mais novo. */
export function lastDays(drops: WaterDrop[], today: string, count = 7): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const drop of drops) counts.set(drop.date, (counts.get(drop.date) ?? 0) + 1);

  return Array.from({ length: count }, (_, i) => {
    const date = shiftDay(today, i - (count - 1));
    return { date, count: counts.get(date) ?? 0 };
  });
}

function shiftDay(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Dias seguidos (terminando hoje ou ontem) com alguma ação. Não pune: hoje ainda em aberto não zera. */
export function careStreak(drops: WaterDrop[], today: string): number {
  const days = new Set(drops.map((drop) => drop.date));
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (days.has(cursor) && daysBetween(cursor, today) < 400) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}
