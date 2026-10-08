import { describe, expect, it } from "vitest";
import { buildSnapshot, DEFAULT_SHARING, sharedCount } from "./snapshot";

const base = {
  checkIns: [{ date: "2026-10-07", mood: "Bem", level: 4 as const }],
  entries: [
    {
      id: "1",
      date: "2026-10-06",
      mood: "Mal",
      title: "Reunião difícil",
      content: "x",
      discussInSession: true,
    },
    { id: "2", date: "2026-10-05", mood: "Bem", title: "Segredo", content: "y" },
  ],
  activities: [{ id: "a", kind: "plan" as const, date: "2026-10-01", answers: {} }],
  sintomas: [{ id: "s", descricao: "Insônia", data: "2026-10-07", nota: "", intensidade: 4 }],
  meds: [{ id: "m", nome: "Sertralina", dosagem: "50 mg", frequencia: "", horario: "08:00" }],
  taken: ["m|2026-10-08|08:00"],
  today: "2026-10-08",
};

describe("visão do profissional", () => {
  it("sem compartilhar nada, não vê nada", () => {
    const snap = buildSnapshot({
      ...base,
      sharing: { mood: false, diary: false, activities: false, health: false },
    });
    expect(snap).toEqual({});
    expect(sharedCount({ mood: false, diary: false, activities: false, health: false })).toBe(0);
  });

  it("diário: só o marcado para a consulta, sem o texto", () => {
    const snap = buildSnapshot({ ...base, sharing: { ...DEFAULT_SHARING, diary: true } });
    expect(snap.topics).toEqual([{ date: "2026-10-06", title: "Reunião difícil" }]);
    expect(JSON.stringify(snap)).not.toContain("Segredo");
  });

  it("com o padrão: humor, atividades e saúde", () => {
    const snap = buildSnapshot({ ...base, sharing: DEFAULT_SHARING });
    expect(snap.topics).toBeUndefined();
    expect(snap.moodDays?.length).toBeGreaterThan(0);
    expect(snap.activities).toHaveLength(1);
    expect(snap.symptoms?.[0].nome).toBe("Insônia");
    expect(snap.meds?.[0]).toMatchObject({ nome: "Sertralina", taken: 1, planned: 7 });
  });
});
