import { addDays } from "@/features/health/logic";
import type { Importance, Task } from "./types";

export const IMPORTANCES: Importance[] = ["high", "medium", "low"];
export const IMPORTANCE_LABEL: Record<Importance, string> = { high: "Alta", medium: "Média", low: "Baixa" };
const RANK: Record<Importance, number> = { high: 0, medium: 1, low: 2 };

/** Com este número de tarefas abertas num dia, o app avisa que o dia está cheio. */
export const FULL_DAY = 6;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidTime = (value: string) => TIME.test(value);
export const isValidDate = (value: string) => DATE.test(value);

/** Abertas primeiro; as com hora por hora; as sem hora por importância. */
export function sortDay(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return RANK[a.importance] - RANK[b.importance];
  });
}

export const tasksOn = (tasks: Task[], date: string): Task[] => sortDay(tasks.filter((t) => t.date === date));

/** Tarefas sem dia ainda não feitas. */
export const inbox = (tasks: Task[]): Task[] => sortDay(tasks.filter((t) => !t.date && !t.done));

/** Tarefas de dias que já passaram e não foram feitas. */
export const overdue = (tasks: Task[], today: string): Task[] =>
  tasks
    .filter((t) => t.date && t.date < today && !t.done)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

/** Tarefas dos próximos dias, agrupadas por data. */
export function upcoming(tasks: Task[], today: string): [string, Task[]][] {
  const dates = [
    ...new Set(tasks.filter((t) => t.date && t.date > today).map((t) => t.date as string)),
  ].sort();
  return dates.map((date) => [date, tasksOn(tasks, date)]);
}

export const openCount = (tasks: Task[], date: string): number =>
  tasks.filter((t) => t.date === date && !t.done).length;

export const isFullDay = (tasks: Task[], date: string): boolean => openCount(tasks, date) >= FULL_DAY;

/** A próxima tarefa: a primeira aberta com hora a partir de agora; senão a primeira aberta sem hora. */
export function nextUp(tasks: Task[], date: string, now: string): Task | undefined {
  const open = tasksOn(tasks, date).filter((t) => !t.done);
  return open.find((t) => t.time && t.time >= now) ?? open.find((t) => !t.time);
}

/** Tarefas que vieram de um profissional não mudam de título nem são apagadas. */
export const isLocked = (task: Task): boolean => task.source !== "free";

export const postponedDate = (today: string): string => addDays(today, 1);

/** Semanas do mês (domingo a sábado). Dias fora do mês vêm como `null`. */
export function monthWeeks(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(first.getDay()).fill(null);
  for (let day = 1; day <= count; day++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export interface TaskInput {
  id: string;
  title: string;
  date?: string;
  time?: string;
  importance: Importance;
  done?: boolean;
  source?: Task["source"];
}

/** Monta uma tarefa limpando os dados. Devolve `null` se não tiver título. */
export function buildTask(input: TaskInput): Task | null {
  const title = input.title.replace(/\s+/g, " ").trim().slice(0, 80);
  if (title.length < 1) return null;
  return {
    id: input.id,
    title,
    date: input.date && isValidDate(input.date) ? input.date : undefined,
    time: input.time && isValidTime(input.time) ? input.time : undefined,
    importance: input.importance,
    done: input.done ?? false,
    source: input.source ?? "free",
  };
}

const escapeICS = (text: string) => text.replace(/([\;,])/g, "\\$1").replace(/\n/g, "\\n");
const compact = (iso: string) => iso.replaceAll("-", "");

/** Arquivo .ics com as tarefas que têm dia, para abrir no calendário do celular. */
export function toICS(tasks: Task[], stamp: string): string {
  const events = tasks
    .filter((t) => t.date && !t.done)
    .flatMap((t) => {
      const date = t.date as string;
      const when = t.time
        ? [`DTSTART:${compact(date)}T${t.time.replace(":", "")}00`]
        : [`DTSTART;VALUE=DATE:${compact(date)}`];
      return [
        "BEGIN:VEVENT",
        `UID:${t.id}@psycare`,
        `DTSTAMP:${stamp}`,
        ...when,
        `SUMMARY:${escapeICS(t.title)}`,
        "END:VEVENT",
      ];
    });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PsyCare//Meu dia//PT",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
