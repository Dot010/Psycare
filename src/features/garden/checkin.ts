import type { CheckIn } from "@/features/garden/types";

/** Um check-in por dia: responder de novo troca o humor do dia. */
export function addCheckIn(list: CheckIn[], date: string, mood: string): CheckIn[] {
  return [...list.filter((item) => item.date !== date), { date, mood }].slice(-120);
}
