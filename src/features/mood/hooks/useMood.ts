"use client";

import { useDiary } from "@/features/diary/hooks/useDiary";
import type { CheckIn } from "@/features/garden/types";
import { CHECKINS_KEY, NO_CHECKINS } from "@/features/garden/water";
import { dailyLevels } from "@/features/mood/logic";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";

/** Tudo o que a página Humor precisa: check-ins, diário e o humor de cada dia. */
export function useMood() {
  const [checkIns] = useLocalStorage<CheckIn[]>(CHECKINS_KEY, NO_CHECKINS);
  const { entries } = useDiary();
  const today = toISODate(new Date());

  return { checkIns, entries, today, levels: dailyLevels(checkIns, entries) };
}
