"use client";

import { useMemo } from "react";
import { useUndo } from "@/components/feedback/UndoProvider";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { addDays } from "@/features/health/logic";
import { toISODate } from "@/lib/dates";
import { insertAt, removeById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import { latestPerMedicine, pendingPrescription } from "@/features/pro/prescriptionRules";
import { applyOverrides, consultaTasks, parseRxTask, receitaTasks } from "../linked";
import { isLocked, postponedDate } from "../logic";
import type { Task, TaskOverride } from "../types";

export const PLANNER_KEY = "psycare:planner:v1";
export const HARD_DAY_KEY = "psycare:planner:hard:v1";
export const LINKED_KEY = "psycare:planner:linked:v1";
const NO_OVERRIDES: Record<string, TaskOverride> = {};

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
  const [own, setOwn] = useLocalStorage<Task[]>(PLANNER_KEY, SEED);
  const [overrides, setOverrides] = useLocalStorage(LINKED_KEY, NO_OVERRIDES);
  const [hardDay, setHardDay] = useLocalStorage<string>(HARD_DAY_KEY, "");
  const { showUndo } = useUndo();
  const rx = usePrescriptions();
  const { appointments } = useAppointments();
  const today = toISODate(new Date());

  /** Tarefas que a pessoa criou, mais as que nascem da receita pronta e das consultas confirmadas. */
  const linked = useMemo(() => {
    const mine = latestPerMedicine(rx.prescriptions.filter((p) => p.patientId === LIVE_PATIENT_ID));
    const pending = mine.flatMap((p) => {
      const found = pendingPrescription(rx.prescriptions, LIVE_PATIENT_ID, p.nome, rx.steps, today);
      return found ? [found] : [];
    });
    return applyOverrides(
      [...receitaTasks(pending, rx.steps, today), ...consultaTasks(appointments, today)],
      overrides,
    );
  }, [rx.prescriptions, rx.steps, appointments, overrides, today]);

  const tasks = useMemo(() => [...own, ...linked], [own, linked]);
  const isLinked = (id: string) => linked.some((t) => t.id === id);

  const patchLinked = (id: string, patch: TaskOverride) =>
    setOverrides((current) => ({ ...current, [id]: { ...current[id], ...patch } }));

  /** Tarefas novas entram no fim; editar mantém a posição. Nas ligadas só dia, hora e importância mudam. */
  const saveTask = (task: Task) => {
    if (isLinked(task.id)) {
      patchLinked(task.id, { date: task.date ?? "", time: task.time ?? "", importance: task.importance });
      return;
    }
    setOwn((current) =>
      current.some((item) => item.id === task.id)
        ? current.map((item) => (item.id === task.id ? task : item))
        : [...current, task],
    );
  };

  const toggleDone = (id: string) => {
    const linkedTask = linked.find((t) => t.id === id);
    if (linkedTask) {
      if (linkedTask.readonly) return;
      const rxTask = parseRxTask(id);
      // Retirar a receita é um passo da receita: quem guarda é o passo "retirei", só do paciente.
      if (rxTask?.kind === "retirar") {
        if (!linkedTask.done) rx.advanceStep(rxTask.prescriptionId);
        return;
      }
      patchLinked(id, { done: !linkedTask.done });
      return;
    }
    setOwn((current) => current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    const index = own.findIndex((t) => t.id === id);
    const removed = own[index];
    if (!removed || isLocked(removed)) return;
    setOwn((current) => removeById(current, id));
    showUndo({
      message: `Tarefa "${removed.title}" excluída.`,
      onUndo: () => setOwn((current) => insertAt(current, removed, index)),
    });
  };

  /** Adiar sem culpa: a tarefa vai para amanhã, mantendo a hora. */
  const postpone = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const tomorrow = postponedDate(today);
    if (isLinked(id)) {
      const before = overrides[id];
      patchLinked(id, { date: tomorrow });
      showUndo({
        message: "Adiado para amanhã. Sem problema.",
        onUndo: () =>
          setOverrides((current) => {
            const { [id]: _drop, ...rest } = current;
            return before ? { ...rest, [id]: before } : rest;
          }),
      });
      return;
    }
    setOwn((current) => current.map((t) => (t.id === id ? { ...t, date: tomorrow } : t)));
    showUndo({
      message: "Adiado para amanhã. Sem problema.",
      onUndo: () => setOwn((current) => current.map((t) => (t.id === id ? target : t))),
    });
  };

  const hardToday = hardDay === today;
  const setHardToday = (on: boolean) => setHardDay(on ? today : "");

  return { today, tasks, saveTask, toggleDone, deleteTask, postpone, hardToday, setHardToday };
}
