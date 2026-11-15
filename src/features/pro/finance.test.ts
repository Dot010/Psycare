import { describe, expect, it } from "vitest";
import {
  buildLedger,
  debtors,
  demoFinanceHistory,
  monthlyTotals,
  monthTotals,
  weeklyBars,
  type Charge,
} from "./finance";
import type { Patient, ProSession, SessionClosing } from "./types";

const patients: Patient[] = [
  { id: "p1", name: "Ana", age: 30, since: "2026-01-01", fee: 180 },
  { id: "p2", name: "Bia", age: 40, since: "2026-01-01", fee: 220 },
];
const today = "2026-11-14";

const closing = (over: Partial<SessionClosing>): SessionClosing => ({
  sessionId: "s1",
  patientId: "p1",
  date: "2026-11-10",
  outcome: "realizada",
  charge: 180,
  paid: false,
  ...over,
});

describe("livro-caixa", () => {
  it("usa o que foi cobrado no fechamento e trata as sessões antigas como pagas", () => {
    const sessions: ProSession[] = [
      { id: "s1", patientId: "p1", data: "2026-11-10", hora: "09:00", tipo: "online", status: "realizada" },
      { id: "s2", patientId: "p2", data: "2026-11-03", hora: "10:00", tipo: "online", status: "realizada" },
      { id: "s3", patientId: "p2", data: "2026-11-20", hora: "10:00", tipo: "online", status: "confirmado" },
    ];
    const ledger = buildLedger(
      sessions,
      [closing({}), closing({ sessionId: "x", outcome: "faltou", charge: 0 })],
      patients,
      today,
    );

    expect(ledger.map((c) => [c.sessionId, c.amount, c.paid])).toEqual([
      ["s1", 180, false],
      ["s2", 220, true],
    ]);
  });

  it("o mês: recebido, pendente, cobradas e taxa de faltas", () => {
    const ledger: Charge[] = [
      { id: "a", patientId: "p1", date: "2026-11-03", amount: 180, paid: true },
      { id: "b", patientId: "p1", date: "2026-11-10", amount: 180, paid: false },
      { id: "c", patientId: "p2", date: "2026-10-28", amount: 220, paid: true },
    ];
    const closings = [
      closing({}),
      closing({ sessionId: "s2", outcome: "faltou" }),
      closing({ sessionId: "s3" }),
      closing({ sessionId: "s4" }),
    ];
    expect(monthTotals(ledger, closings, "2026-11")).toEqual({
      received: 180,
      pending: 180,
      charged: 2,
      missRate: 25,
    });
    expect(monthTotals([], [], "2026-11").missRate).toBeNull();
  });

  it("semanas do mês em blocos de 7 dias, o último com o que sobra", () => {
    const ledger: Charge[] = [
      { id: "a", patientId: "p1", date: "2026-11-03", amount: 180, paid: true },
      { id: "b", patientId: "p1", date: "2026-11-30", amount: 180, paid: false },
    ];
    const bars = weeklyBars(ledger, "2026-11");
    expect(bars.map((b) => b.label)).toEqual(["1 a 7", "8 a 14", "15 a 21", "22 a 28", "29 a 30"]);
    expect(bars[0]).toMatchObject({ paid: 180, pending: 0 });
    expect(bars[4]).toMatchObject({ paid: 0, pending: 180 });
  });

  it("últimos meses do mais antigo ao atual, só o que foi pago", () => {
    const ledger: Charge[] = [
      { id: "a", patientId: "p1", date: "2026-11-03", amount: 180, paid: true },
      { id: "b", patientId: "p1", date: "2026-11-04", amount: 180, paid: false },
      { id: "c", patientId: "p1", date: "2026-09-04", amount: 200, paid: true },
    ];
    expect(monthlyTotals(ledger, today, 3)).toEqual([
      { month: "2026-09", label: "set", total: 200 },
      { month: "2026-10", label: "out", total: 0 },
      { month: "2026-11", label: "nov", total: 180 },
    ]);
  });

  it("quem deve, do maior valor para o menor", () => {
    const ledger: Charge[] = [
      { id: "a", patientId: "p1", date: "2026-11-03", amount: 180, paid: false },
      { id: "b", patientId: "p2", date: "2026-11-04", amount: 220, paid: false },
      { id: "c", patientId: "p1", date: "2026-11-05", amount: 180, paid: false },
      { id: "d", patientId: "p2", date: "2026-11-06", amount: 220, paid: true },
    ];
    expect(debtors(ledger)).toEqual([
      { patientId: "p1", total: 360, count: 2 },
      { patientId: "p2", total: 220, count: 1 },
    ]);
  });

  it("o histórico de exemplo é fixo e só de meses anteriores", () => {
    const history = demoFinanceHistory(patients, today);
    expect(history.length).toBeGreaterThan(0);
    expect(history.every((c) => c.paid && c.date < "2026-11-01" && c.date >= "2026-06-01")).toBe(true);
    expect(demoFinanceHistory(patients, today)).toEqual(history);
  });
});
