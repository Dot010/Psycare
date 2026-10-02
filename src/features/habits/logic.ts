import type { Habit } from "@/features/habits/types";
import { daysBetween } from "@/lib/dates";

export function isDoneToday(habit: Habit, today: string): boolean {
  return habit.lastCompleted === today;
}

/** A sequência vale se o último dia concluído foi hoje ou ontem; passou disso, recomeça do zero. */
export function currentStreak(habit: Habit, today: string): number {
  if (!habit.lastCompleted) return habit.streak;
  return daysBetween(habit.lastCompleted, today) <= 1 ? habit.streak : 0;
}

/** Marca ou desmarca o hábito de hoje, ajustando a sequência. */
export function toggleHabitToday(habit: Habit, today: string): Habit {
  if (isDoneToday(habit, today)) {
    return { ...habit, streak: Math.max(0, habit.streak - 1), lastCompleted: undefined };
  }
  return { ...habit, streak: currentStreak(habit, today) + 1, lastCompleted: today };
}
