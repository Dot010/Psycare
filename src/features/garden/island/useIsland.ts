"use client";

import { useEffect } from "react";
import { cleanFoxName, mergeUnlocks, unlocksFor, type Unlock } from "@/features/garden/island/places";
import { useLocalStorage } from "@/lib/useLocalStorage";

/** Mesmo formato da API (`/api/island/`): troca por chamadas quando o backend entrar no front. */
export interface IslandState {
  foxName: string;
  trips: number;
  unlocked: Unlock[];
}

export const ISLAND_KEY = "psycare:island:v1";
const EMPTY: IslandState = { foxName: "", trips: 0, unlocked: [] };

/** O que a ilha guarda da pessoa. As gotas e as plantas vêm do jardim (cuidados reais), não daqui. */
export function useIsland(progress: { careDays: number; grownPlants: number }) {
  const [island, setIsland] = useLocalStorage<IslandState>(ISLAND_KEY, EMPTY);

  // Só soma o que aparece: nada some depois.
  const key = unlocksFor({ ...progress, trips: island.trips }).join(",");
  useEffect(() => {
    if (!key) return;
    setIsland((current) => {
      const merged = mergeUnlocks(current.unlocked, key.split(",") as Unlock[]);
      return merged.length === current.unlocked.length ? current : { ...current, unlocked: merged };
    });
  }, [key, setIsland]);

  return {
    ...island,
    /** Devolve false se o nome tiver algo que não seja letra. */
    rename(raw: string): boolean {
      const name = cleanFoxName(raw);
      if (name === null) return false;
      setIsland((current) => ({ ...current, foxName: name }));
      return true;
    },
    addTrip() {
      setIsland((current) => ({ ...current, trips: current.trips + 1 }));
    },
  };
}
