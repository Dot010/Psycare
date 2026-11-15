import { describe, expect, it } from "vitest";
import {
  buildClosing,
  closingError,
  closingLine,
  conductText,
  evolutionText,
  groupByDay,
  medicationHistory,
  moodTrend,
  sevenDays,
  sinceLastSession,
  trendSentence,
} from "./logic";
import type { ProSession, SessionClosing } from "./types";

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

describe("agenda", () => {
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
});

describe("consulta do psiquiatra", () => {
  const session: ProSession = {
    id: "c1",
    patientId: "p1",
    data: "2026-10-08",
    hora: "10:00",
    tipo: "presencial",
    status: "confirmado",
  };

  it("a conduta vai junto com a evolução e fica no fechamento", () => {
    const input = {
      outcome: "realizada" as const,
      evolution: "Dormindo melhor. Sem efeitos colaterais.",
      chargeMissed: false,
      conduct: "dose" as const,
      conductNote: "Subiu para 20 mg.",
    };
    expect(evolutionText(session, input)).toBe(
      "Dormindo melhor. Sem efeitos colaterais.\nConduta: ajustar a dose. Subiu para 20 mg.",
    );
    expect(buildClosing(session, { ...input, paid: false }, 320).conduct).toBe("dose");
    expect(conductText("none")).toBe("Conduta: manter a medicação.");
  });

  it("falta não tem conduta", () => {
    const closing = buildClosing(
      session,
      { outcome: "faltou", evolution: "", chargeMissed: false, conduct: "stop", paid: false },
      320,
    );
    expect(closing.conduct).toBeUndefined();
  });

  it("linha do tempo: um item por remédio, o mais novo em cima e os em uso primeiro", () => {
    const rx = (id: string, nome: string, preparedAt: string, status: "ready" | "stopped" = "ready") =>
      ({
        id,
        patientId: "p1",
        nome,
        dosagem: "x",
        kind: "common",
        origin: { type: "consultation", consultationId: "c" },
        preparedAt,
        useFrom: preparedAt,
        useUntil: preparedAt,
        status,
        change: "none",
      }) as const;
    const history = medicationHistory(
      [
        rx("a", "Sertralina", "2026-08-01", "stopped"),
        rx("b", "Escitalopram", "2026-09-01"),
        rx("c", "Escitalopram", "2026-10-01"),
        { ...rx("d", "Outro", "2026-10-01"), patientId: "p2" },
      ],
      "p1",
    );
    expect(history.map((h) => [h.nome, h.current.id, h.previous.map((p) => p.id)])).toEqual([
      ["Escitalopram", "c", ["b"]],
      ["Sertralina", "a", []],
    ]);
  });
});

describe("desde a última sessão", () => {
  const sessions = [
    { id: "a", patientId: "p", data: "2026-11-05", hora: "09:00", tipo: "online", status: "realizada" },
    { id: "b", patientId: "p", data: "2026-11-12", hora: "09:00", tipo: "online", status: "confirmado" },
  ] as Parameters<typeof sinceLastSession>[1];

  it("resume só o que veio depois da última sessão realizada", () => {
    const recap = sinceLastSession(
      {
        moodDays: [
          { date: "2026-11-04", level: 5 },
          { date: "2026-11-06", level: 2 },
          { date: "2026-11-08", level: 4 },
        ],
        topics: [{ date: "2026-11-07", title: "Briga em casa" }],
        meds: [{ nome: "X", dosagem: "", horarios: "", taken: 5, planned: 10 }],
      },
      sessions,
      "p",
      "2026-11-10",
    );
    expect(recap.since).toBe("2026-11-05");
    expect(recap.lines).toEqual([
      "Humor: média 3,0 de 5 em 2 dias, com 1 dia difícil.",
      "Marcou 1 página do diário para conversar: “Briga em casa”.",
      "Remédios: 50% das doses marcadas nos últimos 7 dias.",
    ]);
  });

  it("sem nada compartilhado, não inventa", () => {
    expect(sinceLastSession({}, sessions, "p", "2026-11-10").lines).toEqual([]);
    expect(sinceLastSession(null, [], "p", "2026-11-10")).toEqual({ since: null, lines: [] });
  });
});
