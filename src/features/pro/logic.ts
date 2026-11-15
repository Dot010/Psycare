import type { DayLevel } from "@/features/mood/logic";
import { addDays } from "@/features/health/logic";
import type { Patient, PatientSnapshot, ProSession, SessionClosing } from "./types";

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

/**
 * Resumo do mês de `today` (AAAA-MM). Sessão encerrada no app usa o que foi cobrado nela
 * (pago = recebido; pendente = a receber). As demais seguem a regra antiga:
 * realizadas contam como recebido; confirmadas, a receber.
 */
export function financeSummary(
  sessions: ProSession[],
  patients: Patient[],
  today: string,
  closings: SessionClosing[] = [],
): FinanceSummary {
  const month = today.slice(0, 7);
  const inMonth = sessions.filter((s) => s.data.startsWith(month));
  let received = 0;
  let toReceive = 0;
  const per = new Map<string, { sessions: number; total: number }>();
  for (const s of inMonth) {
    const fee = patients.find((p) => p.id === s.patientId)?.fee ?? 0;
    const closing = closings.find((c) => c.sessionId === s.id);
    if (closing) {
      if (closing.paid) received += closing.charge;
      else toReceive += closing.charge;
      if (closing.charge > 0) {
        const cur = per.get(s.patientId) ?? { sessions: 0, total: 0 };
        per.set(s.patientId, { sessions: cur.sessions + 1, total: cur.total + closing.charge });
      }
    } else if (s.status === "realizada") {
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

export interface ClosingInput {
  outcome: "realizada" | "faltou" | null;
  evolution: string;
  /** Falta: cobrar ou não. Sessão realizada é sempre cobrada. */
  chargeMissed: boolean;
}

export const EVOLUTION_MIN = 10;
export const EVOLUTION_MAX = 4000;

/** O que falta para poder encerrar. `null` = pode encerrar. */
export function closingError(input: ClosingInput): string | null {
  if (!input.outcome) return "Escolha se a sessão aconteceu ou se o paciente faltou.";
  if (input.outcome === "realizada" && input.evolution.trim().length < EVOLUTION_MIN) {
    return "Escreva a evolução da sessão (pelo menos uma frase).";
  }
  return null;
}

/** Monta o fechamento com o valor do dia. Quem chama já validou com `closingError`. */
export function buildClosing(
  session: ProSession,
  input: ClosingInput & { paid: boolean },
  fee: number,
): SessionClosing {
  const charged = input.outcome === "realizada" || input.chargeMissed;
  return {
    sessionId: session.id,
    patientId: session.patientId,
    date: session.data,
    outcome: input.outcome === "faltou" ? "faltou" : "realizada",
    charge: charged ? fee : 0,
    paid: charged && input.outcome === "realizada" ? input.paid : false,
  };
}

/** O texto que vai para o prontuário. A falta também fica registrada, sem precisar escrever. */
export function evolutionText(session: ProSession, input: ClosingInput): string {
  if (input.outcome === "faltou") {
    const note = input.evolution.trim();
    return `O paciente não compareceu à sessão das ${session.hora}.${note ? ` ${note}` : ""}`;
  }
  return input.evolution.trim().slice(0, EVOLUTION_MAX);
}

/** "Evolução salva · R$ 180,00 pendente", para a linha da sessão já encerrada. */
export function closingLine(closing: SessionClosing, money: (n: number) => string): string {
  const first = closing.outcome === "realizada" ? "Evolução salva" : "Falta registrada";
  if (closing.charge === 0) return `${first} · sem cobrança`;
  return `${first} · ${money(closing.charge)} ${closing.paid ? "pago" : "pendente"}`;
}
