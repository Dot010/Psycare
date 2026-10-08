import type { DayLevel } from "@/features/mood/logic";
import { addDays } from "@/features/health/logic";
import type { Patient, PatientSnapshot, ProSession } from "./types";

function avg(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

/** Humor médio dos últimos 7 dias e dos 7 anteriores. */
export function moodTrend(snapshot: PatientSnapshot | null, today: string) {
  if (!snapshot?.moodDays) return null;
  const recent = snapshot.moodDays.filter((d) => d.date > addDays(today, -7)).map((d) => d.level);
  const before = snapshot.moodDays
    .filter((d) => d.date <= addDays(today, -7) && d.date > addDays(today, -14))
    .map((d) => d.level);
  const now = avg(recent);
  const prev = avg(before);
  return { now, prev, delta: now !== null && prev !== null ? now - prev : null };
}

/** Frase neutra sobre a mudança, sem alarme nem diagnóstico. */
export function trendSentence(trend: ReturnType<typeof moodTrend>): string {
  if (!trend || trend.now === null) return "Sem registros de humor recentes.";
  if (trend.delta === null) return "Poucos registros para comparar com a semana anterior.";
  if (trend.delta <= -0.7) return "Humor mais baixo que na semana anterior.";
  if (trend.delta >= 0.7) return "Humor mais alto que na semana anterior.";
  return "Humor parecido com o da semana anterior.";
}

/** Últimos sete dias como a curva do app espera (dia sem registro = null). */
export function sevenDays(snapshot: PatientSnapshot | null, today: string): DayLevel[] {
  const byDate = new Map((snapshot?.moodDays ?? []).map((d) => [d.date, d.level]));
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    return { date, level: byDate.get(date) ?? null };
  });
}

export function daysSinceLastMood(snapshot: PatientSnapshot | null, today: string): number | null {
  const last = snapshot?.moodDays?.at(-1)?.date;
  if (!last) return null;
  return Math.round((Date.parse(today) - Date.parse(last)) / 86_400_000);
}

export function groupByDay(sessions: ProSession[]): { date: string; items: ProSession[] }[] {
  const days = [...new Set(sessions.map((s) => s.data))].sort();
  return days.map((date) => ({
    date,
    items: sessions.filter((s) => s.data === date).sort((a, b) => a.hora.localeCompare(b.hora)),
  }));
}

export interface FinanceSummary {
  received: number;
  toReceive: number;
  count: number;
  byPatient: { patient: Patient; sessions: number; total: number }[];
}

/** Resumo do mês de `today` (AAAA-MM). Sessões realizadas contam como recebido; confirmadas, a receber. */
export function financeSummary(sessions: ProSession[], patients: Patient[], today: string): FinanceSummary {
  const month = today.slice(0, 7);
  const inMonth = sessions.filter((s) => s.data.startsWith(month));
  let received = 0;
  let toReceive = 0;
  const per = new Map<string, { sessions: number; total: number }>();
  for (const s of inMonth) {
    const fee = patients.find((p) => p.id === s.patientId)?.fee ?? 0;
    if (s.status === "realizada") {
      received += fee;
      const cur = per.get(s.patientId) ?? { sessions: 0, total: 0 };
      per.set(s.patientId, { sessions: cur.sessions + 1, total: cur.total + fee });
    } else if (s.status === "confirmado") {
      toReceive += fee;
    }
  }
  return {
    received,
    toReceive,
    count: inMonth.filter((s) => s.status === "realizada").length,
    byPatient: [...per.entries()]
      .map(([id, v]) => ({ patient: patients.find((p) => p.id === id) as Patient, ...v }))
      .filter((row) => row.patient)
      .sort((a, b) => b.total - a.total),
  };
}
