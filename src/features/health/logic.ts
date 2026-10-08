import type { DiaryEntry } from "@/features/diary/types";
import { fromISODate, toISODate } from "@/lib/dates";
import type { Medicamento, Sintoma } from "./types";

export const MAX_TIMES = 6;
export const MAX_ATTACHMENT_BYTES = 1_500_000;
export const ATTACHMENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
export const COMMON_SYMPTOMS = ["Cansaço", "Insônia", "Palpitação", "Irritação", "Dor de cabeça"];
export const INTENSITY_LABELS = ["Muito leve", "Leve", "Moderada", "Forte", "Muito forte"];

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isTime(value: string): boolean {
  return TIME.test(value);
}

/** Horários das doses de um remédio, em ordem e sem repetir. */
export function medTimes(med: Medicamento): string[] {
  const source = med.horarios ?? (isTime(med.horario) ? [med.horario] : []);
  return [...new Set(source.filter(isTime))].sort();
}

export type Period = "Manhã" | "Tarde" | "Noite";

export function periodOf(time: string): Period {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return "Manhã";
  if (hour < 18) return "Tarde";
  return "Noite";
}

export interface DoseItem {
  key: string;
  medId: string;
  nome: string;
  dosagem: string;
  observacao?: string;
  time: string;
  period: Period;
}

export function doseKey(medId: string, date: string, time: string): string {
  return `${medId}|${date}|${time}`;
}

export function dosesForDay(meds: Medicamento[], date: string): DoseItem[] {
  return meds
    .flatMap((med) =>
      medTimes(med).map((time) => ({
        key: doseKey(med.id, date, time),
        medId: med.id,
        nome: med.nome,
        dosagem: med.dosagem,
        observacao: med.observacao,
        time,
        period: periodOf(time),
      })),
    )
    .sort((a, b) => (a.time === b.time ? a.nome.localeCompare(b.nome) : a.time.localeCompare(b.time)));
}

export function toggleKey(taken: string[], key: string): string[] {
  return taken.includes(key) ? taken.filter((k) => k !== key) : [...taken, key];
}

export function doseSentence(total: number, taken: number): string {
  if (total === 0) return "Nenhuma dose marcada para hoje.";
  if (taken === 0) return `${total === 1 ? "1 dose" : `${total} doses`} para hoje.`;
  if (taken === total)
    return total === 1 ? "A dose de hoje foi tomada." : "Todas as doses de hoje foram tomadas.";
  return `${taken} de ${total} doses tomadas.`;
}

export type DayState = "full" | "part" | "none" | "empty";

export interface WeekDay {
  date: string;
  letter: string;
  state: DayState;
  isToday: boolean;
}

const LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function addDays(iso: string, delta: number): string {
  const d = fromISODate(iso);
  return toISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));
}

/** Os sete dias até hoje: quais tiveram todas, algumas ou nenhuma dose marcada. */
export function weekAdherence(meds: Medicamento[], taken: string[], today: string): WeekDay[] {
  const set = new Set(taken);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const doses = dosesForDay(meds, date);
    const done = doses.filter((d) => set.has(d.key)).length;
    const state: DayState =
      doses.length === 0 ? "empty" : done === doses.length ? "full" : done === 0 ? "none" : "part";
    return { date, letter: LETTERS[fromISODate(date).getDay()], state, isToday: date === today };
  });
}

/** Frase sem cobrança sobre a semana. */
export function weekSentence(days: WeekDay[]): string {
  const counted = days.filter((d) => d.state !== "empty" && !d.isToday);
  if (counted.length === 0) return "Quando você marcar suas doses, a semana aparece aqui.";
  const full = counted.filter((d) => d.state === "full").length;
  return `${full} de ${counted.length} dias com todas as doses. Doses que escaparam acontecem, e não tem problema. O que importa é voltar.`;
}

function parseLegacyDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

const LEGACY_INTENSITY: Record<string, number> = { leve: 2, moderada: 3, moderado: 3, intensa: 4, forte: 4 };

/** Aceita sintomas salvos antes da nota de 1 a 5 e das datas em AAAA-MM-DD. */
export function normalizeSintoma(item: Sintoma): Sintoma {
  const intensidade = item.intensidade ?? LEGACY_INTENSITY[item.nota.trim().toLowerCase()] ?? undefined;
  return { ...item, data: parseLegacyDate(item.data), intensidade };
}

export function intensityLabel(value: number | undefined): string {
  return value && value >= 1 && value <= 5 ? INTENSITY_LABELS[value - 1] : "Sem nota";
}

export interface SymptomStat {
  nome: string;
  vezes: number;
  media: number | null;
  maxima: number | null;
}

export function symptomStats(sintomas: Sintoma[], from: string, to: string): SymptomStat[] {
  const groups = new Map<string, Sintoma[]>();
  for (const item of sintomas.map(normalizeSintoma)) {
    if (item.data < from || item.data > to) continue;
    const key = item.descricao.trim();
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()]
    .map(([nome, list]) => {
      const values = list.flatMap((s) => (s.intensidade ? [s.intensidade] : []));
      return {
        nome,
        vezes: list.length,
        media: values.length
          ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
          : null,
        maxima: values.length ? Math.max(...values) : null,
      };
    })
    .sort((a, b) => b.vezes - a.vezes || a.nome.localeCompare(b.nome));
}

export interface ConsultInput {
  meds: Medicamento[];
  taken: string[];
  sintomas: Sintoma[];
  moodByDay: Map<string, number>;
  entries: DiaryEntry[];
  today: string;
  days?: number;
}

function fmt(n: number): string {
  return String(n).replace(".", ",");
}

function br(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Texto para levar à consulta. Só descreve o que a pessoa registrou, sem interpretar. */
export function buildConsultSummary({
  meds,
  taken,
  sintomas,
  moodByDay,
  entries,
  today,
  days = 30,
}: ConsultInput): string[] {
  const from = addDays(today, -(days - 1));
  const set = new Set(taken);
  const lines: string[] = [`Resumo de ${br(from)} a ${br(today)} (últimos ${days} dias)`, ""];

  lines.push("Remédios em uso");
  if (meds.length === 0) lines.push("- Nenhum cadastrado.");
  for (const med of meds) {
    const times = medTimes(med);
    const when = times.length ? ` às ${times.join(", ")}` : "";
    lines.push(`- ${med.nome} ${med.dosagem}${when}${med.observacao ? ` (${med.observacao})` : ""}`);
  }

  let total = 0;
  let done = 0;
  for (let i = 0; i < days; i++) {
    for (const dose of dosesForDay(meds, addDays(from, i))) {
      total++;
      if (set.has(dose.key)) done++;
    }
  }
  lines.push("");
  lines.push("Doses");
  lines.push(
    total === 0
      ? "- Sem doses com horário cadastradas."
      : `- ${done} de ${total} doses marcadas como tomadas (${Math.round((done / total) * 100)}%). Considera os remédios atuais e o que foi marcado no app.`,
  );

  const stats = symptomStats(sintomas, from, today);
  lines.push("");
  lines.push("Sintomas registrados");
  if (stats.length === 0) lines.push("- Nenhum registro no período.");
  for (const s of stats) {
    const detail = s.media !== null ? `, intensidade média ${fmt(s.media)} de 5 (máxima ${s.maxima})` : "";
    lines.push(`- ${s.nome}: ${s.vezes} ${s.vezes === 1 ? "vez" : "vezes"}${detail}`);
  }

  const levels = [...moodByDay.entries()].filter(([date]) => date >= from && date <= today).map(([, v]) => v);
  lines.push("");
  lines.push("Humor (1 a 5)");
  lines.push(
    levels.length === 0
      ? "- Sem registros no período."
      : `- Média ${fmt(Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10)} em ${levels.length} ${levels.length === 1 ? "dia registrado" : "dias registrados"}.`,
  );

  const flagged = entries.filter((e) => e.discussInSession && e.date >= from && e.date <= today);
  if (flagged.length > 0) {
    lines.push("");
    lines.push("Marquei para conversar");
    for (const e of flagged) lines.push(`- ${br(e.date)}: ${e.title}`);
  }

  lines.push("");
  lines.push("Registro feito pelo próprio paciente no PsyCare. Não é um laudo nem uma avaliação clínica.");
  return lines;
}
