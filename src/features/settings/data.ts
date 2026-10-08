import type { DiaryEntry } from "@/features/diary/types";
import type { CheckIn } from "@/features/garden/types";
import { MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { toISODate } from "@/lib/dates";
import { removeStored, writeStored } from "@/lib/storage";

/** Toda chave que o app grava neste navegador começa com isto. */
export const STORAGE_PREFIX = "psycare:";

/** Chaves dos dados de exemplo (as outras não são tocadas ao carregar ou limpar o exemplo). */
export const DEMO_KEYS = ["psycare:checkins:v1", "psycare:diary:v1"] as const;

export interface ExportFile {
  app: "PsyCare";
  exportedAt: string;
  note: string;
  data: Record<string, unknown>;
}

interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
}

/** Chaves do app presentes no armazenamento, em ordem alfabética. */
export function appKeys(storage: StorageLike): string[] {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  return keys.sort();
}

/** Monta o arquivo de exportação com tudo o que o app guardou. Valores que não são JSON viram texto. */
export function buildExport(storage: StorageLike, now: Date = new Date()): ExportFile {
  const data: Record<string, unknown> = {};
  for (const key of appKeys(storage)) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return {
    app: "PsyCare",
    exportedAt: now.toISOString(),
    note: "Seus dados ficam só neste navegador. Este arquivo é uma cópia sua.",
    data,
  };
}

export function exportFileName(now: Date = new Date()): string {
  return `psycare-meus-dados-${toISODate(now)}.json`;
}

/** Quantas chaves do app existem (para mostrar "nada guardado ainda"). */
export function countStored(storage: StorageLike): number {
  return appKeys(storage).length;
}

/** Apaga tudo o que o app guardou neste navegador. */
export function clearAll(storage: StorageLike): number {
  const keys = appKeys(storage);
  keys.forEach((key) => removeStored(key));
  return keys.length;
}

const DEMO_MOODS: ReadonlyArray<{ level: MoodLevel; tags: string[] }> = [
  { level: 3, tags: ["Trabalho"] },
  { level: 4, tags: ["Sono"] },
  { level: 2, tags: ["Trabalho", "Sono"] },
  { level: 4, tags: ["Relacionamentos"] },
  { level: 5, tags: ["Saúde", "Relacionamentos"] },
  { level: 3, tags: ["Família"] },
  { level: 4, tags: ["Sono"] },
  { level: 2, tags: ["Trabalho"] },
];

const DEMO_DIARY: ReadonlyArray<{ daysAgo: number; title: string; content: string; level: MoodLevel }> = [
  {
    daysAgo: 1,
    title: "Um dia mais leve",
    content: "Caminhei depois do almoço e percebi que respirei melhor. Quero repetir amanhã.",
    level: 4,
  },
  {
    daysAgo: 4,
    title: "Cansaço no trabalho",
    content: "Muitas reuniões seguidas. Ao fim do dia, fiz uns minutos de respiração e ajudou.",
    level: 2,
  },
  {
    daysAgo: 9,
    title: "Encontro com amigos",
    content: "Foi bom sair de casa. Ri bastante e dormi melhor depois.",
    level: 5,
  },
];

/** Dados de exemplo cobrindo os últimos dias, só para ver o app preenchido. Os registros são fictícios. */
export function buildDemoData(today: Date = new Date()): { checkins: CheckIn[]; diary: DiaryEntry[] } {
  const dayOffset = (daysAgo: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    return toISODate(d);
  };
  const checkins: CheckIn[] = DEMO_MOODS.map((m, i) => ({
    date: dayOffset(DEMO_MOODS.length - i),
    mood: MOOD_LABELS[m.level],
    level: m.level,
    tags: m.tags,
  }));
  const diary: DiaryEntry[] = DEMO_DIARY.map((e, i) => ({
    id: `demo-${i + 1}`,
    date: dayOffset(e.daysAgo),
    mood: MOOD_LABELS[e.level],
    moodLevel: e.level,
    title: e.title,
    content: e.content,
  }));
  return { checkins, diary };
}

export function loadDemoData(today: Date = new Date()): void {
  const { checkins, diary } = buildDemoData(today);
  writeStored("psycare:checkins:v1", checkins);
  writeStored("psycare:diary:v1", diary);
}

export function clearDemoData(): void {
  DEMO_KEYS.forEach((key) => removeStored(key));
}
