import type { CheckIn } from "@/features/garden/types";
import { MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";

/** Um check-in por dia: responder de novo troca o humor do dia. */
export function addCheckIn(list: CheckIn[], date: string, level: MoodLevel, tags: string[] = []): CheckIn[] {
  const record: CheckIn = { date, mood: MOOD_LABELS[level], level, tags };
  return [...list.filter((item) => item.date !== date), record].slice(-400);
}

/** Troca só as tags do check-in de `date`. Sem check-in nesse dia, não cria nada. */
export function setCheckInTags(list: CheckIn[], date: string, tags: string[]): CheckIn[] {
  return list.map((item) => (item.date === date ? { ...item, tags } : item));
}
