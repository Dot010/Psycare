"use client";

import { addCheckIn } from "@/features/garden/checkin";
import { dropsToNextPlant, gardenPlants, careStreak, lastDays } from "@/features/garden/logic";
import type { CheckIn, WaterDrop } from "@/features/garden/types";
import { CHECKINS_KEY, grantWater, NO_CHECKINS, NO_DROPS, WATER_KEY } from "@/features/garden/water";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";

export function useGarden() {
  const [drops] = useLocalStorage<WaterDrop[]>(WATER_KEY, NO_DROPS);
  const [checkIns, setCheckIns] = useLocalStorage<CheckIn[]>(CHECKINS_KEY, NO_CHECKINS);

  const today = toISODate(new Date());
  const total = drops.length;
  const todayCheckIn = checkIns.find((item) => item.date === today);

  const checkIn = (mood: string) => {
    setCheckIns((current) => addCheckIn(current, today, mood));
    grantWater("checkin");
  };

  return {
    total,
    plants: gardenPlants(total),
    toNext: dropsToNextPlant(total),
    week: lastDays(drops, today, 7),
    streak: careStreak(drops, today),
    todayCheckIn,
    checkIn,
  };
}
