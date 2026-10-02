"use client";

import { Check, Flame, Trash2 } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { NewHabitModal } from "@/features/habits/components/NewHabitModal";
import { getHabitStats } from "@/features/habits/stats";
import type { Habit } from "@/features/habits/types";
import { mockUser } from "@/mocks/user";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/useLocalStorage";

const statLabel = "text-xs font-bold uppercase text-slate-500";

export default function HabitsView() {
  const [habits, setHabits] = useLocalStorage<Habit[]>("psycare:habits", mockUser.habits);

  const addHabit = (habit: Habit) => setHabits((current) => [...current, habit]);
  const removeHabit = (id: string) => setHabits((current) => current.filter((habit) => habit.id !== id));
  const toggleHabit = (id: string) =>
    setHabits((current) =>
      current.map((habit) => (habit.id === id ? { ...habit, completedToday: !habit.completedToday } : habit)),
    );

  const { total, completed, successRate, longestStreak } = getHabitStats(habits);

  return (
    <Page
      title="Meus Hábitos"
      description="Registre seus hábitos e acompanhe sua evolução."
      actions={<NewHabitModal onAddHabit={addHabit} />}
    >
      <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className={statLabel}>Concluídos hoje</dt>
          <dd className="mt-1 text-2xl font-black text-slate-800">
            {completed}/{total}
          </dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className={statLabel}>Taxa de sucesso</dt>
          <dd className="mt-1 text-2xl font-black text-brand-600">{successRate}%</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <dt className={statLabel}>Maior sequência</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-2xl font-black text-amber-500">
            <Flame className="size-6" />
            {longestStreak} {longestStreak === 1 ? "dia" : "dias"}
          </dd>
        </div>
      </dl>

      {habits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Nenhum hábito ainda. Crie o primeiro em &ldquo;Novo hábito&rdquo;.
        </p>
      ) : (
        <ul className="space-y-3">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 shadow-sm",
                habit.completedToday ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white",
              )}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {habit.category}
                </span>
                <p
                  className={cn(
                    "text-lg font-bold",
                    habit.completedToday ? "text-slate-400 line-through" : "text-slate-800",
                  )}
                >
                  {habit.title}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-sm font-bold text-amber-600">
                  <Flame className="size-4" />
                  {habit.streak}d
                </span>

                <button
                  type="button"
                  aria-pressed={habit.completedToday}
                  aria-label={`${habit.completedToday ? "Desmarcar" : "Concluir"} ${habit.title}`}
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                    habit.completedToday
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-200 bg-white text-transparent hover:border-brand-500 hover:text-brand-500",
                  )}
                >
                  <Check className="size-4" />
                </button>

                <button
                  type="button"
                  aria-label={`Remover ${habit.title}`}
                  onClick={() => removeHabit(habit.id)}
                  className="flex size-9 items-center justify-center rounded-full border-2 border-slate-200 text-slate-400 transition-colors hover:border-red-300 hover:text-red-500"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
