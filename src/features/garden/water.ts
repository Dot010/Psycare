import { addDrop, dropId } from "@/features/garden/logic";
import type { CheckIn, WaterDrop, WaterSource } from "@/features/garden/types";
import { toISODate } from "@/lib/dates";
import { readStored, writeStored } from "@/lib/storage";

export const WATER_KEY = "psycare:garden-water:v1";
export const CHECKINS_KEY = "psycare:checkins:v1";
/** Evento do navegador disparado quando o jardim ganha uma gota (cena 3D e som escutam). */
export const WATER_EVENT = "psycare:water";
export const NO_DROPS: WaterDrop[] = [];
export const NO_CHECKINS: CheckIn[] = [];

/**
 * Dá uma gota de água ao jardim por uma ação real (hábito feito, diário escrito, check-in, respiração).
 * Funciona de qualquer lugar, sem hook. Repetir a mesma ação no mesmo dia não rende mais água.
 */
export function grantWater(source: WaterSource, ref?: string): void {
  const date = toISODate(new Date());
  const current = readStored<WaterDrop[]>(WATER_KEY, NO_DROPS);
  const next = addDrop(current, { id: dropId(source, date, ref), source, date });
  if (next === current) return;
  writeStored(WATER_KEY, next);
  window.dispatchEvent(new CustomEvent(WATER_EVENT, { detail: { source } }));
}
