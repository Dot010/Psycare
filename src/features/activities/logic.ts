import { daysBetween, fromISODate } from "@/lib/dates";
import { ACTIVITIES, SLEEP_NIGHTS, WHEEL_AREAS } from "./catalog";
import type { ActivityKind, ActivityRecord, Answers, Assignment } from "./types";

export const MAX_TEXT = 600;
export const MAX_NOTE = 400;
/** Depois disso, sugerimos refazer a atividade para comparar. */
export const REDO_AFTER_DAYS = 30;
/** Atividades que fazem sentido repetir de tempos em tempos. */
const REDO_KINDS: ActivityKind[] = ["wheel", "values"];

export function newestFirst(records: ActivityRecord[]): ActivityRecord[] {
  return [...records].sort((a, b) =>
    a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date),
  );
}

export function latestOfKind(records: ActivityRecord[], kind: ActivityKind): ActivityRecord | undefined {
  return newestFirst(records).find((record) => record.kind === kind);
}

/** O registro imediatamente anterior a `record` do mesmo tipo. */
export function previousOfKind(
  records: ActivityRecord[],
  record: ActivityRecord,
): ActivityRecord | undefined {
  return newestFirst(records).find(
    (item) => item.kind === record.kind && item.id !== record.id && item.date <= record.date,
  );
}

export function suggestsRedo(record: ActivityRecord, today: string): boolean {
  return REDO_KINDS.includes(record.kind) && daysBetween(record.date, today) >= REDO_AFTER_DAYS;
}

export function pendingAssignments(list: Assignment[]): Assignment[] {
  return list.filter((item) => !item.doneRecordId);
}

export interface Validation {
  ok: boolean;
  errors: Record<string, string>;
  answers: Answers;
}

/** Limpa os textos, confere o que é obrigatório e os limites das escalas. */
export function validateAnswers(kind: ActivityKind, raw: Answers): Validation {
  const errors: Record<string, string> = {};
  const answers: Answers = {};
  for (const field of ACTIVITIES[kind].fields) {
    const value = raw[field.id];
    if (field.type === "text" || field.type === "long") {
      const text = typeof value === "string" ? value.replace(/\s+$/g, "").trim().slice(0, MAX_TEXT) : "";
      if (text) answers[field.id] = text;
      else if (field.required) errors[field.id] = "Escreva algo aqui.";
    } else if (field.type === "scale") {
      if (typeof value === "number" && Number.isFinite(value) && value >= field.min && value <= field.max) {
        answers[field.id] = Math.round(value);
      } else if (field.required) {
        errors[field.id] = "Escolha um número.";
      }
    } else if (field.type === "hours") {
      if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 16) {
        answers[field.id] = Math.round(value * 2) / 2;
      }
    } else if (field.type === "multi" && Array.isArray(value)) {
      const chosen = value.filter((item) => field.options.includes(item)).slice(0, field.maxSelect);
      if (chosen.length) answers[field.id] = chosen;
    }
  }
  if (kind === "sleep" && sleepHours(answers).length === 0) errors.n1 = "Anote ao menos uma noite.";
  if (kind === "values" && !answers.chosen) errors.chosen = "Escolha ao menos um valor.";
  return { ok: Object.keys(errors).length === 0, errors, answers };
}

export function cleanNote(note: string): string | undefined {
  const text = note.trim().slice(0, MAX_NOTE);
  return text || undefined;
}

export interface WheelRow {
  area: string;
  before: number | null;
  now: number;
  delta: number | null;
}

function scoreOf(record: ActivityRecord, area: string): number | null {
  const value = record.answers[area];
  return typeof value === "number" ? value : null;
}

export function compareWheel(current: ActivityRecord, previous?: ActivityRecord): WheelRow[] {
  return WHEEL_AREAS.map((area) => {
    const now = scoreOf(current, area) ?? 0;
    const before = previous ? scoreOf(previous, area) : null;
    return { area, before, now, delta: before === null ? null : now - before };
  });
}

export function wheelSentence(rows: WheelRow[]): string {
  const withDelta = rows.filter((row) => row.delta !== null);
  if (withDelta.length === 0)
    return "Esta é a sua primeira roda. Daqui a algumas semanas, refaça para ver o que mudou.";
  const best = Math.max(...withDelta.map((row) => row.delta as number));
  if (best <= 0) {
    const all = withDelta.every((row) => row.delta === 0);
    return all
      ? "Tudo igual desde a última vez. Estabilidade também conta."
      : "Algumas áreas pesaram mais desta vez. Isso diz muito do momento, não de você.";
  }
  const top = withDelta.filter((row) => row.delta === best).map((row) => row.area);
  const names = top.length === 1 ? top[0] : `${top.slice(0, -1).join(", ")} e ${top[top.length - 1]}`;
  const verb = top.length === 1 ? "foi a área que mais subiu" : "foram as áreas que mais subiram";
  return `${names} ${verb}, ${best} ${best === 1 ? "ponto" : "pontos"}${top.length > 1 ? " cada" : ""}.`;
}

export function sleepHours(answers: Answers): number[] {
  const hours: number[] = [];
  for (let i = 1; i <= SLEEP_NIGHTS; i++) {
    const value = answers[`n${i}`];
    if (typeof value === "number") hours.push(value);
  }
  return hours;
}

export function sleepAverage(answers: Answers): number | null {
  const hours = sleepHours(answers);
  if (hours.length === 0) return null;
  return Math.round((hours.reduce((sum, h) => sum + h, 0) / hours.length) * 10) / 10;
}

export function thermometerSentence(answers: Answers): string | null {
  const before = answers.before;
  const after = answers.after;
  if (typeof before !== "number" || typeof after !== "number") return null;
  if (after < before) return `De ${before} para ${after}. O que você fez ajudou.`;
  if (after === before) return `Continuou em ${before}. Nem todo gesto muda o número na hora, e tudo bem.`;
  return `Foi de ${before} para ${after}. Dia pesado: vale levar isso para a conversa com o seu profissional.`;
}

/** Texto curto para a lista de atividades feitas. */
export function recordSummary(record: ActivityRecord): string {
  const a = record.answers;
  switch (record.kind) {
    case "thermometer": {
      const sentence = thermometerSentence(a);
      return sentence ?? "";
    }
    case "sleep": {
      const avg = sleepAverage(a);
      return avg === null ? "" : `média de ${String(avg).replace(".", ",")} h por noite`;
    }
    case "values":
      return Array.isArray(a.chosen) ? a.chosen.join(", ") : "";
    case "plan":
      return typeof a.step === "string" ? `primeiro passo: ${a.step}` : "";
    case "thoughts":
      return typeof a.emotion === "string" ? `emoção: ${a.emotion}` : "";
    default:
      return "";
  }
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" }).format(fromISODate(iso));
}

export function formatDayShort(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" })
    .format(fromISODate(iso))
    .replace(".", "");
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
