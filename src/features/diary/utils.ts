import type { DiaryEntry } from "@/features/diary/types";
import { entryLevel, levelFromLabel, MOOD_LABELS, MOOD_LEVELS } from "@/features/mood/logic";
import { daysBetween, fromISODate, toISODate } from "@/lib/dates";

/** Os cinco humores para filtrar a lista (registros antigos entram pelo rosto mais próximo). */
export const MOODS = MOOD_LEVELS.map((level) => MOOD_LABELS[level]);

/** "Hoje", "Ontem" ou "3 de setembro de 2026". */
export function dayHeading(iso: string, today: string): string {
  const diff = daysBetween(iso, today);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return fromISODate(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export interface DayGroup {
  date: string;
  entries: DiaryEntry[];
}

/** Agrupa por dia, do mais recente para o mais antigo. Dentro do dia mantém a ordem recebida. */
export function groupByDay(entries: DiaryEntry[]): DayGroup[] {
  const groups = new Map<string, DiaryEntry[]>();
  for (const entry of entries) {
    groups.set(entry.date, [...(groups.get(entry.date) ?? []), entry]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, list]) => ({ date, entries: list }));
}

export interface EntryFilters {
  query: string;
  mood: string;
  onlyForSession: boolean;
}

export function filterEntries(
  entries: DiaryEntry[],
  { query, mood, onlyForSession }: EntryFilters,
): DiaryEntry[] {
  const needle = query.trim().toLowerCase();
  return entries.filter((entry) => {
    if (mood && entryLevel(entry) !== levelFromLabel(mood)) return false;
    if (onlyForSession && !entry.discussInSession) return false;
    if (!needle) return true;
    return [entry.title, entry.content, entry.mood].some((text) => text.toLowerCase().includes(needle));
  });
}

export interface TrendPoint {
  date: string;
  /** Média da ansiedade (1 a 5) no dia, ou null se não houve registro com nível. */
  average: number | null;
}

/** Média diária de ansiedade nos últimos `days` dias (inclui hoje), do mais antigo ao mais novo. */
export function getAnxietyTrend(entries: DiaryEntry[], today: string, days = 14): TrendPoint[] {
  const end = fromISODate(today);
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(end);
    day.setDate(end.getDate() - (days - 1 - index));
    const date = toISODate(day);
    const levels = entries
      .filter((entry) => entry.date === date && entry.anxietyLevel !== undefined)
      .map((entry) => entry.anxietyLevel as number);
    const average = levels.length ? levels.reduce((sum, level) => sum + level, 0) / levels.length : null;
    return { date, average };
  });
}

/** Cor da faixa lateral de cada registro, da calma (verde) à carga alta (marrom). */
export const ANXIETY_COLORS: Record<number, string> = {
  1: "var(--color-brand-500)",
  2: "var(--color-brand-300)",
  3: "var(--color-sun-300)",
  4: "var(--color-taupe)",
  5: "var(--color-ink)",
};

export function anxietyColor(level: number | undefined): string {
  return level === undefined ? "var(--border)" : (ANXIETY_COLORS[Math.round(level)] ?? "var(--border)");
}

/** Convites para quem não sabe por onde começar. Um por dia, sempre o mesmo naquele dia. */
export const DAILY_PROMPTS = [
  "O que foi bom hoje, mesmo que pequeno?",
  "O que você está sentindo agora, e onde sente isso no corpo?",
  "Do que você precisa neste momento?",
  "O que pesou hoje e o que ajudou a aliviar?",
  "Quem ou o que te fez bem esta semana?",
  "Se um amigo estivesse no seu lugar, o que você diria a ele?",
  "O que você gostaria de deixar para trás hoje?",
];

export function dailyPrompt(date: string): string {
  const index =
    ((daysBetween("2026-01-01", date) % DAILY_PROMPTS.length) + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[index];
}

/** Em quantos dos últimos `days` dias (hoje incluso) houve ao menos um registro. */
export function writtenDays(entries: DiaryEntry[], today: string, days = 7): number {
  const dates = new Set(entries.map((entry) => entry.date));
  let count = 0;
  for (let back = 0; back < days; back++) {
    const day = fromISODate(today);
    day.setDate(day.getDate() - back);
    if (dates.has(toISODate(day))) count++;
  }
  return count;
}

const TITLE_LENGTH = 40;

/** Quando a pessoa não escreve título, usa o começo do texto. */
export function titleFromContent(content: string): string {
  const firstLine = content.trim().split("\n")[0].trim();
  if (firstLine.length <= TITLE_LENGTH) return firstLine;
  const cut = firstLine.slice(0, TITLE_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 15 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
