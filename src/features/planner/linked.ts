import { addDays } from "@/features/health/logic";
import type { Agendamento } from "@/features/appointments/types";
import type { PatientStep, Prescription } from "@/features/pro/types";
import type { Task, TaskOverride } from "./types";

export const LINKED_PREFIX = { receita: "rx:", consulta: "consulta:" } as const;

/** "rx:<receita>:retirar" ou "rx:<receita>:comprar" → ids da receita e da etapa. */
export function parseRxTask(id: string): { prescriptionId: string; kind: "retirar" | "comprar" } | undefined {
  const match = /^rx:(.+):(retirar|comprar)$/.exec(id);
  return match ? { prescriptionId: match[1], kind: match[2] as "retirar" | "comprar" } : undefined;
}

/**
 * Tarefas que nascem de uma receita pronta: retirar o papel e comprar o remédio.
 * Elas somem sozinhas quando o paciente marca que comprou (a receita deixa de estar pendente).
 */
export function receitaTasks(
  pending: Prescription[],
  steps: Record<string, PatientStep>,
  today: string,
): Task[] {
  return pending.flatMap((p) => {
    const step = steps[p.id];
    return [
      {
        id: `rx:${p.id}:retirar`,
        title: `Retirar a receita de ${p.nome}`,
        date: today,
        importance: "high" as const,
        done: step === "retirei" || step === "comprei",
        source: "receita" as const,
      },
      {
        id: `rx:${p.id}:comprar`,
        title: `Comprar o remédio ${p.nome}`,
        date: addDays(today, 1),
        importance: "high" as const,
        done: false,
        source: "receita" as const,
        href: "/dashboard/health",
        readonly: true,
      },
    ];
  });
}

/** Consultas confirmadas que ainda não passaram, como tarefas do Meu dia. */
export function consultaTasks(appointments: Agendamento[], today: string): Task[] {
  return appointments
    .filter((a) => a.status === "confirmado" && a.data >= today)
    .map((a) => ({
      id: `${LINKED_PREFIX.consulta}${a.id}`,
      title: `Consulta com ${a.profissional}${a.tipo === "online" ? " (online)" : ""}`,
      date: a.data,
      time: a.hora,
      importance: "high" as const,
      done: false,
      source: "consulta" as const,
      href: "/dashboard/appointments",
    }));
}

/** Aplica o que a pessoa mudou (dia, hora, importância, feito) em cada tarefa ligada. */
export function applyOverrides(tasks: Task[], overrides: Record<string, TaskOverride>): Task[] {
  return tasks.map((t) => {
    const o = overrides[t.id];
    if (!o) return t;
    return {
      ...t,
      date: o.date !== undefined ? o.date || undefined : t.date,
      time: o.time !== undefined ? o.time || undefined : t.time,
      importance: o.importance ?? t.importance,
      done: o.done ?? t.done,
    };
  });
}
