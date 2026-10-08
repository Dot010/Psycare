"use client";

import { useSyncExternalStore } from "react";
import { addCheckIn, setCheckInTags } from "@/features/garden/checkin";
import {
  availableDrops,
  careStreak,
  dropsToNextPlant,
  gardenPlants,
  lastDays,
  sourcesOnDay,
} from "@/features/garden/logic";
import type { CheckIn, WaterDrop } from "@/features/garden/types";
import type { MoodLevel } from "@/features/mood/types";
import {
  CHECKINS_KEY,
  grantWater,
  isPouring,
  NO_CHECKINS,
  NO_DROPS,
  POURED_KEY,
  pourWater,
  subscribePouring,
  WATER_KEY,
} from "@/features/garden/water";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";

export function useGarden() {
  const [drops] = useLocalStorage<WaterDrop[]>(WATER_KEY, NO_DROPS);
  const [storedPoured] = useLocalStorage<number | null>(POURED_KEY, null);
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>(CHECKINS_KEY, NO_CHECKINS);
  const pouring = useSyncExternalStore(subscribePouring, isPouring, () => false);

  const today = toISODate(new Date());
  const earned = drops.length;
  // Sem a chave, é um jardim de antes do regador: tudo o que foi ganho já conta como despejado.
  const poured = storedPoured ?? earned;
  const todayCheckIn = checkIns.find((item) => item.date === today);

  const checkIn = (level: MoodLevel) => {
    // Trocar o rosto no mesmo dia mantém as tags já marcadas.
    setCheckIns((current) => addCheckIn(current, today, level, current.find((i) => i.date === today)?.tags));
    grantWater("checkin");
  };

  const setTags = (tags: string[]) => setCheckIns((current) => setCheckInTags(current, today, tags));

  return {
    /** Gotas já despejadas: o que faz o jardim crescer. */
    poured,
    /** Gotas no regador, prontas para despejar. */
    available: availableDrops(earned, poured),
    pouring,
    pour: () => pourWater(),
    plants: gardenPlants(poured),
    toNext: dropsToNextPlant(poured),
    week: lastDays(drops, today, 7),
    streak: careStreak(drops, today),
    doneToday: sourcesOnDay(drops, today),
    todayCheckIn,
    checkIns,
    checkIn,
    setTags,
  };
}
