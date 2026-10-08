"use client";

import { useUndo } from "@/components/feedback/UndoProvider";
import { grantWater } from "@/features/garden/water";
import { isDoneToday, toggleHabitToday } from "@/features/habits/logic";
import type { Habit } from "@/features/habits/types";
import { toISODate } from "@/lib/dates";
import { insertAt, removeById, upsertById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";

export const HABITS_KEY = "psycare:habits:v1";

export function useHabits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(HABITS_KEY, mockUser.habits);
  const { showUndo } = useUndo();

  /** Novos hábitos entram no fim da lista; editar mantém a posição. */
  const saveHabit = (habit: Habit) =>
    setHabits((current) =>
      current.some((item) => item.id === habit.id) ? upsertById(current, habit) : [...current, habit],
    );

  const toggleHabit = (id: string) => {
    const today = toISODate(new Date());
    const target = habits.find((habit) => habit.id === id);
    // Concluir rega o jardim; desmarcar não tira a água (o jardim nunca murcha).
    if (target && !isDoneToday(target, today)) grantWater("habit", id);
    setHabits((current) =>
      current.map((habit) => (habit.id === id ? toggleHabitToday(habit, today) : habit)),
    );
  };

  const deleteHabit = (id: string) => {
    const index = habits.findIndex((habit) => habit.id === id);
    const removed = habits[index];
    if (!removed) return;
    setHabits((current) => removeById(current, id));
    showUndo({
      message: `Hábito "${removed.title}" excluído.`,
      onUndo: () => setHabits((current) => insertAt(current, removed, index)),
    });
  };

  return { habits, saveHabit, toggleHabit, deleteHabit };
}
