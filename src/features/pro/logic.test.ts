import { describe, expect, it } from "vitest";
import { financeSummary, groupByDay, moodTrend, sevenDays, trendSentence } from "./logic";
import type { Patient, ProSession } from "./types";

const today = "2026-10-08";
const snap = {
  moodDays: [
    { date: "2026-09-30", level: 4 },
    { date: "2026-10-01", level: 4 },
    { date: "2026-10-05", level: 2 },
    { date: "2026-10-08", level: 2 },
  ],
};

describe("tendência de humor", () => {
  it("compara a semana com a anterior sem dramatizar", () => {
    const trend = moodTrend(snap, today);
    expect(trend).toEqual({ now: 2, prev: 4, delta: -2 });
    expect(trendSentence(trend)).toBe("Humor mais baixo que na semana anterior.");
  });
  it("sem dados ou sem base de comparação", () => {
    expect(trendSentence(moodTrend(null, today))).toMatch(/Sem registros/);
    expect(trendSentence(moodTrend({ moodDays: [{ date: "2026-10-07", level: 3 }] }, today))).toMatch(
      /Poucos/,
    );
    expect(trendSentence(moodTrend({}, today))).toMatch(/Sem registros/);
  });
  it("sete dias, com buraco como null", () => {
    const days = sevenDays(snap, today);
    expect(days).toHaveLength(7);
    expect(days[6]).toEqual({ date: "2026-10-08", level: 2 });
    expect(days[0].level).toBeNull();
  });
});

describe("agenda e financeiro", () => {
  const patients: Patient[] = [
    { id: "a", name: "A", age: 30, since: "2026-01-01", fee: 200 },
    { id: "b", name: "B", age: 30, since: "2026-01-01", fee: 100 },
  ];
  const s = (
    id: string,
    patientId: string,
    data: string,
    status: ProSession["status"],
    hora = "10:00",
  ): ProSession => ({
    id,
    patientId,
    data,
    hora,
    tipo: "online",
    status,
  });
  it("agrupa por dia e ordena por hora", () => {
    const groups = groupByDay([
      s("1", "a", "2026-10-09", "confirmado", "15:00"),
      s("2", "b", "2026-10-09", "confirmado", "09:00"),
      s("3", "a", "2026-10-08", "confirmado"),
    ]);
    expect(groups.map((g) => g.date)).toEqual(["2026-10-08", "2026-10-09"]);
    expect(groups[1].items.map((i) => i.id)).toEqual(["2", "1"]);
  });
  it("soma recebido e a receber só do mês", () => {
    const summary = financeSummary(
      [
        s("1", "a", "2026-10-02", "realizada"),
        s("2", "a", "2026-10-03", "realizada"),
        s("3", "b", "2026-10-04", "realizada"),
        s("4", "b", "2026-10-20", "confirmado"),
        s("5", "a", "2026-09-30", "realizada"),
        s("6", "a", "2026-10-21", "cancelado"),
      ],
      patients,
      today,
    );
    expect(summary.received).toBe(500);
    expect(summary.toReceive).toBe(100);
    expect(summary.count).toBe(3);
    expect(summary.byPatient[0]).toMatchObject({ sessions: 2, total: 400 });
  });
});
