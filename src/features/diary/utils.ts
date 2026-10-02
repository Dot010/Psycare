import type { DiaryEntry } from "@/features/diary/types";
import { daysBetween, fromISODate, toISODate } from "@/lib/dates";

export const MOODS = ["Calmo", "Ansioso", "Motivado", "Sobrecarregado", "Reflexivo"];

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
    if (mood && entry.mood !== mood) return false;
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
