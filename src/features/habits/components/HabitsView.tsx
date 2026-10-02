"use client";

import { Check, Flame, Plus, Sprout } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { HabitModal } from "@/features/habits/components/HabitModal";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { currentStreak, isDoneToday } from "@/features/habits/logic";
import { getHabitStats } from "@/features/habits/stats";
import type { Habit } from "@/features/habits/types";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const statLabel = "text-xs font-bold uppercase text-muted-foreground";

export default function HabitsView() {
  const { habits, saveHabit, toggleHabit, deleteHabit } = useHabits();
  const [editing, setEditing] = useState<Habit | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const today = toISODate(new Date());
  const { total, completed, successRate, longestStreak } = getHabitStats(habits, today);

  const openNew = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  return (
    <Page
      title="Meus Hábitos"
      description="Registre seus hábitos e acompanhe sua evolução."
      actions={
        <Button onClick={openNew}>
          <Plus />
          Novo hábito
        </Button>
      }
    >
      <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <dt className={statLabel}>Concluídos hoje</dt>
          <dd className="mt-1 text-2xl font-black text-foreground">
            {completed}/{total}
          </dd>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <dt className={statLabel}>Taxa de sucesso</dt>
          <dd className="mt-1 text-2xl font-black text-brand-600">{successRate}%</dd>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <dt className={statLabel}>Maior sequência</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-2xl font-black text-sun-700">
            <Flame className="size-6" />
            {longestStreak} {longestStreak === 1 ? "dia" : "dias"}
          </dd>
        </div>
      </dl>

      {habits.length === 0 ? (
        <EmptyState
          title="Nenhum hábito ainda"
          description="Comece com algo pequeno, como beber água ou caminhar dez minutos."
          action={
            <Button onClick={openNew}>
              <Sprout />
              Criar o primeiro hábito
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {habits.map((habit) => {
            const done = isDoneToday(habit, today);
            const streak = currentStreak(habit, today);
            return (
              <li
                key={habit.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm",
                  done ? "border-brand-200 bg-brand-50" : "border-border bg-card",
                )}
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {habit.category}
                  </span>
                  <p
                    className={cn(
                      "truncate text-lg font-bold",
                      done ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {habit.title}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-sun-100 px-2.5 py-1 text-sm font-bold text-sun-700">
                    <Flame className="size-4" />
                    {streak}d
                  </span>

                  <button
                    type="button"
                    aria-pressed={done}
                    aria-label={`${done ? "Desmarcar" : "Concluir"} ${habit.title}`}
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                      done
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-input bg-card text-transparent hover:border-brand-600 hover:text-brand-600",
                    )}
                  >
                    <Check className="size-4" />
                  </button>

                  <ItemMenu
                    label={`hábito "${habit.title}"`}
                    onEdit={() => {
                      setEditing(habit);
                      setModalOpen(true);
                    }}
                    onDelete={() => deleteHabit(habit.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <HabitModal open={modalOpen} onOpenChange={setModalOpen} habit={editing} onSave={saveHabit} />
    </Page>
  );
}
