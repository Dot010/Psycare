import type { Patient, ProSession, SessionClosing } from "./types";

/**
 * O livro-caixa do consultório: cada linha é uma cobrança.
 * Vem de três lugares: o "Encerrar sessão" (o que foi cobrado de verdade), as sessões antigas
 * da demonstração e um histórico de exemplo dos meses anteriores, para os gráficos terem o que mostrar.
 */
export interface Charge {
  id: string;
  /** A sessão de origem, quando existe (para marcar como pago). */
  sessionId?: string;
  patientId: string;
  /** AAAA-MM-DD */
  date: string;
  amount: number;
  paid: boolean;
  /** Cobrança de uma falta. */
  missed?: boolean;
}

export function buildLedger(
  sessions: ProSession[],
  closings: SessionClosing[],
  patients: Patient[],
  today: string,
  history: Charge[] = [],
): Charge[] {
  const fee = (id: string) => patients.find((p) => p.id === id)?.fee ?? 0;
  const fromClosings: Charge[] = closings
    .filter((c) => c.charge > 0)
    .map((c) => ({
      id: `fech-${c.sessionId}`,
      sessionId: c.sessionId,
      patientId: c.patientId,
      date: c.date,
      amount: c.charge,
      paid: c.paid,
      missed: c.outcome === "faltou",
    }));
  // Sessões já realizadas antes do "Encerrar sessão" existir: contam como pagas, com o valor do paciente.
  const legacy: Charge[] = sessions
    .filter((s) => s.status === "realizada" && s.data <= today && !closings.some((c) => c.sessionId === s.id))
    .map((s) => ({
      id: `sess-${s.id}`,
      sessionId: s.id,
      patientId: s.patientId,
      date: s.data,
      amount: fee(s.patientId),
      paid: true,
    }));
  return [...fromClosings, ...legacy, ...history].sort((a, b) => b.date.localeCompare(a.date));
}

export interface MonthTotals {
  received: number;
  pending: number;
  /** Sessões cobradas no mês (faltas cobradas incluídas). */
  charged: number;
  /** Faltas / (realizadas + faltas), entre as sessões encerradas no app. `null` sem dados. */
  missRate: number | null;
}

export function monthTotals(ledger: Charge[], closings: SessionClosing[], month: string): MonthTotals {
  const inMonth = ledger.filter((c) => c.date.startsWith(month));
  const closed = closings.filter((c) => c.date.startsWith(month));
  const missed = closed.filter((c) => c.outcome === "faltou").length;
  return {
    received: inMonth.filter((c) => c.paid).reduce((sum, c) => sum + c.amount, 0),
    pending: inMonth.filter((c) => !c.paid).reduce((sum, c) => sum + c.amount, 0),
    charged: inMonth.length,
    missRate: closed.length ? Math.round((missed / closed.length) * 100) : null,
  };
}

export interface WeekBar {
  /** "1 a 7", "8 a 14"... */
  label: string;
  paid: number;
  pending: number;
}

/** O mês em blocos de 7 dias (o último fica com o que sobrar), com o pago e o pendente de cada um. */
export function weeklyBars(ledger: Charge[], month: string): WeekBar[] {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const bars: WeekBar[] = [];
  for (let start = 1; start <= lastDay; start += 7) {
    const end = Math.min(start + 6, lastDay);
    const inWeek = ledger.filter((c) => {
      if (!c.date.startsWith(month)) return false;
      const day = Number(c.date.slice(8));
      return day >= start && day <= end;
    });
    bars.push({
      label: `${start} a ${end}`,
      paid: inWeek.filter((c) => c.paid).reduce((sum, c) => sum + c.amount, 0),
      pending: inWeek.filter((c) => !c.paid).reduce((sum, c) => sum + c.amount, 0),
    });
  }
  return bars;
}

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** O total recebido nos últimos `count` meses, do mais antigo ao atual. */
export function monthlyTotals(
  ledger: Charge[],
  today: string,
  count = 6,
): { month: string; label: string; total: number }[] {
  const [y, m] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(y, m - 1 - (count - 1 - i), 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const total = ledger
      .filter((c) => c.date.startsWith(month) && c.paid)
      .reduce((sum, c) => sum + c.amount, 0);
    return { month, label: MONTH_SHORT[date.getMonth()], total };
  });
}

/** Quem tem cobrança pendente, do maior valor para o menor. */
export function debtors(ledger: Charge[]): { patientId: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const c of ledger.filter((item) => !item.paid)) {
    const cur = map.get(c.patientId) ?? { total: 0, count: 0 };
    map.set(c.patientId, { total: cur.total + c.amount, count: cur.count + 1 });
  }
  return [...map.entries()].map(([patientId, v]) => ({ patientId, ...v })).sort((a, b) => b.total - a.total);
}

/**
 * Histórico de exemplo dos 5 meses anteriores (sessões semanais, já pagas), só para a demonstração.
 * É determinístico: o mesmo `today` gera sempre os mesmos números.
 */
export function demoFinanceHistory(patients: Patient[], today: string): Charge[] {
  const [y, m] = today.split("-").map(Number);
  const charges: Charge[] = [];
  const weekly = patients.filter((p) => !p.live);
  for (let back = 5; back >= 1; back--) {
    const first = new Date(y, m - 1 - back, 1);
    const month = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}`;
    weekly.forEach((patient, index) => {
      // Cada paciente fez entre 2 e 4 sessões no mês, variando de forma fixa para o gráfico ter forma.
      const sessions = 2 + ((back + index) % 3);
      for (let s = 0; s < sessions; s++) {
        const day = String(Math.min(28, 3 + index * 2 + s * 7)).padStart(2, "0");
        const date = `${month}-${day}`;
        if (date < patient.since) continue;
        charges.push({
          id: `hist-${patient.id}-${date}`,
          patientId: patient.id,
          date,
          amount: patient.fee,
          paid: true,
        });
      }
    });
  }
  return charges;
}
