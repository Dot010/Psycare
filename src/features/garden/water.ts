import { addDrop, availableDrops, dropId } from "@/features/garden/logic";
import type { CheckIn, WaterDrop, WaterSource } from "@/features/garden/types";
import { toISODate } from "@/lib/dates";
import { readStored, writeStored } from "@/lib/storage";

/** Gotas GANHAS por ações de cuidado (o regador enche). */
export const WATER_KEY = "psycare:garden-water:v1";
/** Quantas gotas já foram DESPEJADAS no jardim (é o que faz as plantas crescerem). */
export const POURED_KEY = "psycare:garden-poured:v1";
export const CHECKINS_KEY = "psycare:checkins:v1";
/** Disparado a cada gota despejada: a cena 3D faz a gota cair e o som toca. */
export const WATER_EVENT = "psycare:water";
/** Disparado quando uma ação de cuidado enche o regador (avisa "+1 gota"). */
export const WATER_EARNED_EVENT = "psycare:water-earned";
export const NO_DROPS: WaterDrop[] = [];
export const NO_CHECKINS: CheckIn[] = [];

/** Quantas gotas saem por toque em "Regar" (para a animação não ficar longa). */
export const MAX_POUR_PER_TAP = 8;
const FALL_MS = 700;
const GAP_MS = 350;

/**
 * Gotas despejadas. Quem já tinha jardim antes do regador (chave ainda não existe) mantém tudo o que
 * ganhou como já despejado, então o jardim não encolhe.
 */
export function readPoured(): number {
  const stored = readStored<number | null>(POURED_KEY, null);
  return stored ?? readStored<WaterDrop[]>(WATER_KEY, NO_DROPS).length;
}

/**
 * Enche o regador com uma gota por uma ação real (hábito feito, diário escrito, check-in, respiração).
 * Funciona de qualquer lugar, sem hook. Repetir a mesma ação no mesmo dia não rende mais água.
 */
export function grantWater(source: WaterSource, ref?: string): void {
  const date = toISODate(new Date());
  const current = readStored<WaterDrop[]>(WATER_KEY, NO_DROPS);
  const next = addDrop(current, { id: dropId(source, date, ref), source, date });
  if (next === current) return;

  // Fixa o que já existia como despejado antes da primeira gota nova do regador.
  if (readStored<number | null>(POURED_KEY, null) === null) writeStored(POURED_KEY, current.length);

  writeStored(WATER_KEY, next);
  window.dispatchEvent(new CustomEvent(WATER_EARNED_EVENT, { detail: { source } }));
}

let pouring = false;
const pouringListeners = new Set<() => void>();

function setPouring(value: boolean) {
  pouring = value;
  pouringListeners.forEach((listener) => listener());
}

export function isPouring(): boolean {
  return pouring;
}

export function subscribePouring(listener: () => void): () => void {
  pouringListeners.add(listener);
  return () => {
    pouringListeners.delete(listener);
  };
}

/**
 * Despeja as gotas do regador no jardim, uma por vez: a gota cai (evento), e quando "pousa" a planta cresce
 * (o contador de despejadas sobe). Devolve quantas serão despejadas neste toque.
 */
export function pourWater(onDone?: () => void): number {
  if (pouring) return 0;
  const earned = readStored<WaterDrop[]>(WATER_KEY, NO_DROPS).length;
  const count = Math.min(availableDrops(earned, readPoured()), MAX_POUR_PER_TAP);
  if (count === 0) return 0;

  setPouring(true);
  let done = 0;

  const dropOne = () => {
    window.dispatchEvent(new CustomEvent(WATER_EVENT));
    window.setTimeout(() => {
      writeStored(POURED_KEY, readPoured() + 1);
      done += 1;
      if (done < count) {
        window.setTimeout(dropOne, GAP_MS);
      } else {
        setPouring(false);
        onDone?.();
      }
    }, FALL_MS);
  };

  dropOne();
  return count;
}
