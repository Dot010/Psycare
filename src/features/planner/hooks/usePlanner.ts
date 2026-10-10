"use client";

import { useUndo } from "@/components/feedback/UndoProvider";
import { addDays } from "@/features/health/logic";
import { toISODate } from "@/lib/dates";
import { insertAt, removeById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { isLocked, postponedDate } from "../logic";
import type { Task } from "../types";

export const PLANNER_KEY = "psycare:planner:v1";
export const HARD_DAY_KEY = "psycare:planner:hard:v1";

/** Tarefas de exemplo para a demonstração, em torno do dia em que o app abriu. */
function demoTasks(today: string): Task[] {
  const free = (id: string, title: string, extra: Partial<Task> = {}): Task => ({
    id,
    title,
    importance: "medium",
    done: false,
    source: "free",
    ...extra,
  });
  return [
    free("t1", "Tomar café da manhã com calma", { date: today, time: "08:00" }),
    free("t2", "Caminhar 15 minutos", { date: today, time: "17:30", importance: "high" }),
    free("t3", "Responder o e-mail da faculdade", { date: today }),
    free("t4", "Ligar para a minha mãe", { date: addDays(today, 1), time: "19:00" }),
    free("t5", "Organizar a gaveta de remédios", { importance: "low" }),
  ];
}

const SEED = demoTasks(toISODate(new Date()));

export function usePlanner() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(PLANNER_KEY, SEED);
  const [hardDay, setHardDay] = useLocalStorage<string>(HARD_DAY_KEY, "");
  const { showUndo } = useUndo();
  const today = toISODate(new Date());

  /** Tarefas novas entram no fim; editar mantém a posição. */
  const saveTask = (task: Task) =>
    setTasks((current) =>
      current.some((item) => item.id === task.id)
        ? current.map((item) => (item.id === task.id ? task : item))
        : [...current, task],
    );

  const toggleDone = (id: string) =>
    setTasks((current) => current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: string) => {
    const index = tasks.findIndex((t) => t.id === id);
    const removed = tasks[index];
    if (!removed || isLocked(removed)) return;
    setTasks((current) => removeById(current, id));
    showUndo({
      message: `Tarefa "${removed.title}" excluída.`,
      onUndo: () => setTasks((current) => insertAt(current, removed, index)),
    });
  };

  /** Adiar sem culpa: a tarefa vai para amanhã, mantendo a hora. */
  const postpone = (id: string) => {
    const before = tasks.find((t) => t.id === id);
    if (!before) return;
    setTasks((current) => current.map((t) => (t.id === id ? { ...t, date: postponedDate(today) } : t)));
    showUndo({
      message: "Adiado para amanhã. Sem problema.",
      onUndo: () => setTasks((current) => current.map((t) => (t.id === id ? before : t))),
    });
  };

  const hardToday = hardDay === today;
  const setHardToday = (on: boolean) => setHardDay(on ? today : "");

  return { today, tasks, saveTask, toggleDone, deleteTask, postpone, hardToday, setHardToday };
}
