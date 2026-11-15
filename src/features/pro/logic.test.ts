import { describe, expect, it } from "vitest";
import {
  buildClosing,
  closingError,
  closingLine,
  evolutionText,
  financeSummary,
  groupByDay,
  moodTrend,
  sevenDays,
  trendSentence,
} from "./logic";
import type { Patient, ProSession, SessionClosing } from "./types";

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

describe("encerrar sessão", () => {
  const session: ProSession = {
    id: "s9",
    patientId: "p1",
    data: "2026-10-08",
    hora: "14:00",
    tipo: "online",
    status: "confirmado",
  };
  const brl = (n: number) => `R$ ${n}`;

  it("pede o resultado e, se a sessão aconteceu, a evolução", () => {
    expect(closingError({ outcome: null, evolution: "", chargeMissed: false })).toMatch(/aconteceu/);
    expect(closingError({ outcome: "realizada", evolution: "ok", chargeMissed: false })).toMatch(/evolução/);
    expect(
      closingError({ outcome: "realizada", evolution: "Trabalhamos o sono.", chargeMissed: false }),
    ).toBeNull();
    expect(closingError({ outcome: "faltou", evolution: "", chargeMissed: false })).toBeNull();
  });

  it("sessão realizada é cobrada com o valor do dia; pago ou pendente", () => {
    const input = { outcome: "realizada" as const, evolution: "Trabalhamos o sono.", chargeMissed: false };
    expect(buildClosing(session, { ...input, paid: true }, 180)).toEqual({
      sessionId: "s9",
      patientId: "p1",
      date: "2026-10-08",
      outcome: "realizada",
      charge: 180,
      paid: true,
    });
    expect(buildClosing(session, { ...input, paid: false }, 180).paid).toBe(false);
  });

  it("falta só é cobrada se escolher, e fica pendente", () => {
    const sem = buildClosing(
      session,
      { outcome: "faltou", evolution: "", chargeMissed: false, paid: true },
      180,
    );
    const com = buildClosing(
      session,
      { outcome: "faltou", evolution: "", chargeMissed: true, paid: true },
      180,
    );
    expect([sem.charge, sem.paid]).toEqual([0, false]);
    expect([com.charge, com.paid]).toEqual([180, false]);
  });

  it("a falta também vai para o prontuário, com a hora", () => {
    expect(evolutionText(session, { outcome: "faltou", evolution: "", chargeMissed: false })).toBe(
      "O paciente não compareceu à sessão das 14:00.",
    );
    expect(
      evolutionText(session, {
        outcome: "realizada",
        evolution: "  Falamos do trabalho. ",
        chargeMissed: false,
      }),
    ).toBe("Falamos do trabalho.");
  });

  it("resume a sessão encerrada numa linha", () => {
    const c = (over: Partial<SessionClosing>): SessionClosing => ({
      sessionId: "s9",
      patientId: "p1",
      date: "2026-10-08",
      outcome: "realizada",
      charge: 180,
      paid: false,
      ...over,
    });
    expect(closingLine(c({}), brl)).toBe("Evolução salva · R$ 180 pendente");
    expect(closingLine(c({ paid: true }), brl)).toBe("Evolução salva · R$ 180 pago");
    expect(closingLine(c({ outcome: "faltou", charge: 0 }), brl)).toBe("Falta registrada · sem cobrança");
  });

  it("no financeiro, o que foi cobrado no fechamento vale mais que a regra antiga", () => {
    const patients: Patient[] = [{ id: "p1", name: "Ana", age: 30, since: "2026-01-01", fee: 180 }];
    const s1: ProSession = { ...session, id: "a", status: "realizada" };
    const s2: ProSession = { ...session, id: "b", status: "faltou" };
    const closings: SessionClosing[] = [
      { sessionId: "a", patientId: "p1", date: "2026-10-08", outcome: "realizada", charge: 180, paid: false },
      { sessionId: "b", patientId: "p1", date: "2026-10-08", outcome: "faltou", charge: 0, paid: false },
    ];
    const summary = financeSummary([s1, s2], patients, today, closings);
    expect([summary.received, summary.toReceive]).toEqual([0, 180]);
  });
});
