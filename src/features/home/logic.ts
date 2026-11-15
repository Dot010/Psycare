import type { DiaryEntry } from "@/features/diary/types";

/** "Bom dia, Ana" / "Boa tarde!" conforme a hora (0 a 23). */
export function timeGreeting(name: string, hour: number): string {
  const part = hour >= 5 && hour < 12 ? "Bom dia" : hour >= 12 && hour < 18 ? "Boa tarde" : "Boa noite";
  const clean = name.trim();
  return clean ? `${part}, ${clean}` : `${part}!`;
}

/**
 * Quantos registros do diário a pessoa marcou para levar à próxima sessão:
 * os marcados depois da última sessão que já passou.
 */
export function entriesForSession(entries: DiaryEntry[], lastSessionDate?: string): number {
  return entries.filter(
    (entry) => entry.discussInSession && (!lastSessionDate || entry.date > lastSessionDate),
  ).length;
}

/** "Terça, 18/11" a partir de AAAA-MM-DD. */
export function weekdayShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long" }).split("-")[0];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

export interface NextStepInput {
  /** Agora, "HH:MM". */
  now: string;
  /** A sessão de hoje ainda por vir (hora e profissional), se houver. */
  sessionToday?: { hora: string; profissional: string };
  /** Doses de hoje ainda não marcadas. */
  pendingDoses: { nome: string; time: string }[];
  /** Já registrou o humor hoje? */
  checkedIn: boolean;
  /** A próxima tarefa aberta do Meu dia, se houver. */
  task?: { title: string; time?: string };
  /** "Hoje está difícil": só o essencial (remédio, sessão e como você está). */
  hardDay?: boolean;
}

export interface NextStep {
  kind: "dose" | "session" | "checkin" | "task" | "done";
  title: string;
  detail: string;
  href?: string;
  action?: string;
}

const minutes = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5));

/**
 * A resposta para "o que eu faço agora?": uma coisa só, a mais importante do momento.
 * Remédio na hora (ou atrasado) vem primeiro; depois a sessão que está chegando, o registro de humor,
 * a próxima tarefa. Com tudo feito, um descanso.
 */
export function nextStep(input: NextStepInput): NextStep {
  const now = minutes(input.now);
  const dose = input.pendingDoses
    .filter((d) => minutes(d.time) <= now + 30)
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  if (dose)
    return {
      kind: "dose",
      title: `Tomar ${dose.nome}`,
      detail:
        minutes(dose.time) < now - 30 ? `Era às ${dose.time}. Ainda dá tempo.` : `Dose das ${dose.time}.`,
      href: "/dashboard/health",
      action: "Abrir remédios",
    };
  if (input.sessionToday && minutes(input.sessionToday.hora) - now <= 120)
    return {
      kind: "session",
      title: `Sua sessão é às ${input.sessionToday.hora}`,
      detail: `Com ${input.sessionToday.profissional}. Veja o que levar.`,
      href: "/dashboard/appointments",
      action: "Preparar a sessão",
    };
  if (!input.checkedIn)
    return {
      kind: "checkin",
      title: "Como você está agora?",
      detail: "Leva 10 segundos, logo aqui embaixo.",
    };
  if (input.sessionToday)
    return {
      kind: "session",
      title: `Hoje tem sessão às ${input.sessionToday.hora}`,
      detail: `Com ${input.sessionToday.profissional}. Veja o que levar.`,
      href: "/dashboard/appointments",
      action: "Preparar a sessão",
    };
  if (input.task && !input.hardDay)
    return {
      kind: "task",
      title: input.task.title,
      detail: input.task.time ? `Às ${input.task.time}. Só essa, por enquanto.` : "Só essa, por enquanto.",
      href: "/dashboard/planner",
      action: "Abrir o Meu dia",
    };
  return {
    kind: "done",
    title: input.hardDay ? "Hoje basta o essencial" : "Tudo em dia por agora",
    detail: input.hardDay
      ? "Você já fez o que importava. O resto espera."
      : "Que tal um tempo no seu refúgio?",
    href: "/dashboard/garden",
    action: "Ir para o refúgio",
  };
}
