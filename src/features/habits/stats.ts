import { currentStreak, isDoneToday } from "@/features/habits/logic";
import type { Habit } from "@/features/habits/types";

export interface HabitStats {
  total: number;
  completed: number;
  /** Porcentagem inteira (0 a 100). Lista vazia conta como 0. */
  successRate: number;
  longestStreak: number;
}

export function getHabitStats(habits: Habit[], today: string): HabitStats {
  const total = habits.length;
  const completed = habits.filter((habit) => isDoneToday(habit, today)).length;

  return {
    total,
    completed,
    successRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    longestStreak: habits.reduce((max, habit) => Math.max(max, currentStreak(habit, today)), 0),
  };
}
