import type { DiaryEntry } from "@/features/diary/types";
import type { CheckIn } from "@/features/garden/types";
import type { MoodLevel } from "@/features/mood/types";
import { fromISODate, toISODate } from "@/lib/dates";

export const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Muito mal",
  2: "Mal",
  3: "Mais ou menos",
  4: "Bem",
  5: "Muito bem",
};

/** As palavras que o app usava antes dos rostos, no rosto mais próximo. */
export const LEGACY_MOODS: Record<string, MoodLevel> = {
  Sobrecarregado: 1,
  Ansioso: 2,
  Reflexivo: 3,
  Calmo: 4,
  Motivado: 5,
};

/** O que mais costuma pesar. A pessoa ainda pode acrescentar a sua. */
export const MOOD_TAGS = ["Sono", "Trabalho", "Família", "Saúde", "Relacionamentos", "Dinheiro"];
export const MAX_TAG_LENGTH = 24;
export const MAX_TAGS = 8;

/** Limpa uma tag digitada: tira espaços repetidos, limita o tamanho e põe a primeira letra em maiúscula. */
export function normalizeTag(raw: string): string | null {
  const clean = raw.replace(/\s+/g, " ").trim().slice(0, MAX_TAG_LENGTH).trim();
  if (clean.length < 2) return null;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** Liga ou desliga uma tag, sem repetir e sem passar de MAX_TAGS. */
export function toggleTag(tags: string[], tag: string): string[] {
  if (tags.includes(tag)) return tags.filter((item) => item !== tag);
  if (tags.length >= MAX_TAGS) return tags;
  return [...tags, tag];
}

export function levelFromLabel(label: string): MoodLevel | undefined {
  const found = (Object.entries(MOOD_LABELS) as [string, string][]).find(([, text]) => text === label);
  if (found) return Number(found[0]) as MoodLevel;
  return LEGACY_MOODS[label];
}

export function checkInLevel(checkIn: CheckIn): MoodLevel | undefined {
  return checkIn.level ?? levelFromLabel(checkIn.mood);
}

export function entryLevel(entry: DiaryEntry): MoodLevel | undefined {
  return entry.moodLevel ?? levelFromLabel(entry.mood);
}

export function mean(values: number[]): number | null {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

/**
 * O humor de cada dia. O check-in manda; sem check-in, vale a média dos registros do diário daquele dia.
 */
export function dailyLevels(checkIns: CheckIn[], entries: DiaryEntry[]): Map<string, number> {
  const fromEntries = new Map<string, number[]>();
  for (const entry of entries) {
    const level = entryLevel(entry);
    if (level === undefined) continue;
    fromEntries.set(entry.date, [...(fromEntries.get(entry.date) ?? []), level]);
  }

  const result = new Map<string, number>();
  for (const [date, levels] of fromEntries) result.set(date, mean(levels) as number);
  for (const checkIn of checkIns) {
    const level = checkInLevel(checkIn);
    if (level !== undefined) result.set(checkIn.date, level);
  }
  return result;
}

export function shiftDate(iso: string, delta: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + delta);
  return toISODate(date);
}

export interface DayLevel {
  date: string;
  level: number | null;
}

/** Os últimos `count` dias (hoje por último). Dia sem registro vem com `level: null`. */
export function lastLevels(levels: Map<string, number>, today: string, count = 7): DayLevel[] {
  return Array.from({ length: count }, (_, index) => {
    const date = shiftDate(today, index - (count - 1));
    return { date, level: levels.get(date) ?? null };
  });
}

export function averageOf(days: DayLevel[]): number | null {
  return mean(days.flatMap((day) => (day.level === null ? [] : [day.level])));
}

/** "Uma semana um pouco mais leve que a anterior." */
export function weekSentence(current: number | null, previous: number | null): string {
  if (current === null) return "Registre como você está e a sua semana aparece aqui.";
  if (previous !== null) {
    const diff = current - previous;
    if (diff >= 0.3) return "Uma semana um pouco mais leve que a anterior.";
    if (diff <= -0.3) return "Uma semana mais pesada que a anterior. Vá com calma.";
    return "Uma semana parecida com a anterior.";
  }
  if (current >= 3.5) return "Uma semana mais leve.";
  if (current >= 2.5) return "Uma semana no meio do caminho.";
  return "Uma semana pesada. Vá com calma.";
}

export interface MonthCell {
  date: string;
  day: number;
  level: number | null;
  isToday: boolean;
  isFuture: boolean;
}

/** O mês de `today` em semanas (domingo primeiro). Os dias vazios do começo vêm como `null`. */
export function monthGrid(levels: Map<string, number>, today: string): (MonthCell | null)[] {
  const current = fromISODate(today);
  const year = current.getFullYear();
  const month = current.getMonth();
  const total = new Date(year, month + 1, 0).getDate();
  const lead = new Date(year, month, 1).getDay();

  const cells: (MonthCell | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= total; day++) {
    const date = toISODate(new Date(year, month, day));
    cells.push({
      date,
      day,
      level: levels.get(date) ?? null,
      isToday: date === today,
      isFuture: date > today,
    });
  }
  return cells;
}

export function monthTitle(today: string): string {
  const name = fromISODate(today).toLocaleDateString("pt-BR", { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export interface TagCount {
  tag: string;
  days: number;
}

/** Quantos dias cada tag foi marcada nos últimos `window` dias, da mais frequente para a menos. */
export function tagFrequency(checkIns: CheckIn[], today: string, window = 30, limit = 5): TagCount[] {
  const from = shiftDate(today, -(window - 1));
  const counts = new Map<string, number>();
  for (const checkIn of checkIns) {
    if (checkIn.date < from || checkIn.date > today) continue;
    for (const tag of new Set(checkIn.tags ?? [])) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, days]) => ({ tag, days }))
    .sort((a, b) => b.days - a.days || a.tag.localeCompare(b.tag, "pt-BR"))
    .slice(0, limit);
}

export interface TagImpact {
  tag: string;
  /** Média do humor nos dias com a tag menos a média nos dias sem ela. */
  difference: number;
}

const MIN_DAYS_PER_GROUP = 3;
const MIN_DIFFERENCE = 0.5;

/**
 * A tag que mais anda junto com um humor diferente. Só conta com dias suficientes dos dois lados,
 * para não tirar conclusão de dois ou três registros. É um resumo dos registros, não uma explicação.
 */
export function strongestTagImpact(checkIns: CheckIn[], levels: Map<string, number>): TagImpact | null {
  const tagged = checkIns.filter((checkIn) => checkIn.tags?.length && levels.has(checkIn.date));
  const allTags = new Set(tagged.flatMap((checkIn) => checkIn.tags ?? []));
  const withLevel = checkIns.filter((checkIn) => levels.has(checkIn.date));

  let best: TagImpact | null = null;
  for (const tag of allTags) {
    const withTag = withLevel.filter((checkIn) => checkIn.tags?.includes(tag));
    const without = withLevel.filter((checkIn) => !checkIn.tags?.includes(tag));
    if (withTag.length < MIN_DAYS_PER_GROUP || without.length < MIN_DAYS_PER_GROUP) continue;

    const a = mean(withTag.map((checkIn) => levels.get(checkIn.date) as number)) as number;
    const b = mean(without.map((checkIn) => levels.get(checkIn.date) as number)) as number;
    const difference = a - b;
    if (Math.abs(difference) < MIN_DIFFERENCE) continue;
    if (!best || Math.abs(difference) > Math.abs(best.difference)) best = { tag, difference };
  }
  return best;
}

export function formatDecimal(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

export function impactSentence(impact: TagImpact): string {
  const points = formatDecimal(Math.abs(impact.difference));
  const direction = impact.difference < 0 ? "mais baixo" : "mais alto";
  return `Nos dias em que você marcou ${impact.tag}, seu humor ficou em média ${points} ponto${points === "1,0" ? "" : "s"} ${direction}.`;
}
