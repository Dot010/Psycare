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
