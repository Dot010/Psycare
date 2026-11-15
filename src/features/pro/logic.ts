import type { DayLevel } from "@/features/mood/logic";
import { addDays } from "@/features/health/logic";
import type { PatientSnapshot, Prescription, PrescriptionChange, ProSession, SessionClosing } from "./types";

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

export interface ClosingInput {
  outcome: "realizada" | "faltou" | null;
  evolution: string;
  /** Falta: cobrar ou não. Sessão realizada é sempre cobrada. */
  chargeMissed: boolean;
  /** Só na consulta do psiquiatra: o que foi decidido sobre a medicação. */
  conduct?: PrescriptionChange;
  conductNote?: string;
}

/** A conduta na consulta do psiquiatra. Usa os mesmos valores da mudança na receita. */
export const CONDUCT_LABEL: Record<PrescriptionChange, string> = {
  none: "Manter a medicação",
  dose: "Ajustar a dose",
  switch: "Trocar o remédio",
  stop: "Suspender",
};

/** "Conduta: ajustar a dose. Subiu para 20 mg." */
export function conductText(conduct: PrescriptionChange, note?: string): string {
  const label = CONDUCT_LABEL[conduct].toLowerCase();
  const clean = note?.trim();
  return `Conduta: ${label}.${clean ? ` ${clean}` : ""}`;
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
    ...(input.conduct && input.outcome === "realizada" ? { conduct: input.conduct } : {}),
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
  const text = input.evolution.trim().slice(0, EVOLUTION_MAX);
  return input.conduct ? `${text}\n${conductText(input.conduct, input.conductNote)}` : text;
}

/** "Evolução salva · R$ 180,00 pendente", para a linha da sessão já encerrada. */
export function closingLine(closing: SessionClosing, money: (n: number) => string): string {
  const first = closing.outcome === "realizada" ? "Evolução salva" : "Falta registrada";
  if (closing.charge === 0) return `${first} · sem cobrança`;
  return `${first} · ${money(closing.charge)} ${closing.paid ? "pago" : "pendente"}`;
}

export interface MedHistory {
  nome: string;
  /** A receita mais nova desse remédio. */
  current: Prescription;
  /** As anteriores, da mais nova para a mais antiga. */
  previous: Prescription[];
}

/** A linha do tempo da medicação de um paciente: um item por remédio, os em uso primeiro. */
export function medicationHistory(prescriptions: Prescription[], patientId: string): MedHistory[] {
  const byName = new Map<string, Prescription[]>();
  for (const p of prescriptions.filter((item) => item.patientId === patientId)) {
    const key = p.nome.trim().toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), p]);
  }
  return [...byName.values()]
    .map((list) => {
      const sorted = [...list].sort((a, b) => b.preparedAt.localeCompare(a.preparedAt));
      return { nome: sorted[0].nome, current: sorted[0], previous: sorted.slice(1) };
    })
    .sort((a, b) =>
      a.current.status === b.current.status
        ? a.nome.localeCompare(b.nome)
        : a.current.status === "ready"
          ? -1
          : 1,
    );
}
