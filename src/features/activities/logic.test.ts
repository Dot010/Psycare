import { describe, expect, it } from "vitest";
import { WHEEL_AREAS } from "./catalog";
import {
  compareWheel,
  latestOfKind,
  pendingAssignments,
  previousOfKind,
  recordSummary,
  sleepAverage,
  suggestsRedo,
  thermometerSentence,
  validateAnswers,
  wheelSentence,
} from "./logic";
import type { ActivityRecord } from "./types";

function wheel(id: string, date: string, scores: number[]): ActivityRecord {
  return {
    id,
    kind: "wheel",
    date,
    answers: Object.fromEntries(WHEEL_AREAS.map((area, i) => [area, scores[i]])),
  };
}

describe("validação", () => {
  it("exige os campos obrigatórios e limpa textos", () => {
    const bad = validateAnswers("plan", { goal: "  ", step: "" });
    expect(bad.ok).toBe(false);
    expect(Object.keys(bad.errors)).toEqual(["goal", "step"]);
    const good = validateAnswers("plan", { goal: " Caminhar ", step: "Calçar o tênis", extra: "x" });
    expect(good.ok).toBe(true);
    expect(good.answers).toEqual({ goal: "Caminhar", step: "Calçar o tênis" });
  });

  it("rejeita escala fora do limite e arredonda", () => {
    const scores = WHEEL_AREAS.map(() => 5);
    const ok = validateAnswers("wheel", Object.fromEntries(WHEEL_AREAS.map((a, i) => [a, scores[i]])));
    expect(ok.ok).toBe(true);
    const bad = validateAnswers("wheel", { Saúde: 11 });
    expect(bad.errors["Saúde"]).toBeDefined();
  });

  it("sono aceita noites em branco mas não nenhuma", () => {
    expect(validateAnswers("sleep", {}).ok).toBe(false);
    const v = validateAnswers("sleep", { n1: 6.7, n2: 20, n3: 8 });
    expect(v.ok).toBe(true);
    expect(v.answers.n1).toBe(6.5);
    expect(v.answers.n2).toBeUndefined();
    expect(sleepAverage(v.answers)).toBe(7.3);
  });

  it("valores: só opções válidas, até o limite", () => {
    const v = validateAnswers("values", {
      chosen: ["Família", "Inventado", "Fé", "Calma", "Natureza", "Respeito", "Liberdade"],
    });
    expect(v.answers.chosen).toEqual(["Família", "Fé", "Calma", "Natureza", "Respeito"]);
  });
});

describe("roda da vida", () => {
  const before = wheel("a", "2026-09-02", [4, 7, 5, 3, 4, 4, 6, 6]);
  const now = wheel("b", "2026-10-08", [6, 7, 6, 5, 6, 4, 7, 7]);

  it("compara com o registro anterior", () => {
    const rows = compareWheel(now, before);
    expect(rows[0]).toEqual({ area: "Saúde", before: 4, now: 6, delta: 2 });
    expect(wheelSentence(rows)).toBe(
      "Saúde, Trabalho e Lazer foram as áreas que mais subiram, 2 pontos cada.",
    );
  });

  it("primeira roda não tem comparação", () => {
    expect(compareWheel(now)[0].delta).toBeNull();
    expect(wheelSentence(compareWheel(now))).toMatch(/primeira roda/);
  });

  it("sem melhora não culpa a pessoa", () => {
    const worse = wheel("c", "2026-10-09", [3, 7, 5, 3, 4, 4, 6, 6]);
    expect(wheelSentence(compareWheel(worse, before))).toMatch(/não de você/);
    expect(wheelSentence(compareWheel(before, before))).toMatch(/Estabilidade/);
  });

  it("acha anterior e mais recente", () => {
    const list = [before, now];
    expect(latestOfKind(list, "wheel")?.id).toBe("b");
    expect(previousOfKind(list, now)?.id).toBe("a");
    expect(previousOfKind(list, before)).toBeUndefined();
  });

  it("sugere refazer depois de 30 dias", () => {
    expect(suggestsRedo(before, "2026-10-02")).toBe(true);
    expect(suggestsRedo(before, "2026-09-20")).toBe(false);
  });
});

describe("outras atividades", () => {
  it("termômetro descreve sem julgar", () => {
    expect(thermometerSentence({ before: 8, after: 5 })).toMatch(/De 8 para 5/);
    expect(thermometerSentence({ before: 5, after: 5 })).toMatch(/tudo bem/);
    expect(thermometerSentence({ before: 3, after: 6 })).toMatch(/profissional/);
    expect(thermometerSentence({ before: 3 })).toBeNull();
  });

  it("resumos", () => {
    expect(
      recordSummary({ id: "1", kind: "values", date: "2026-10-01", answers: { chosen: ["Fé", "Calma"] } }),
    ).toBe("Fé, Calma");
    expect(recordSummary({ id: "2", kind: "sleep", date: "2026-10-01", answers: { n1: 7, n2: 6 } })).toBe(
      "média de 6,5 h por noite",
    );
  });

  it("separa pedidos pendentes", () => {
    const list = [
      { id: "1", kind: "wheel" as const, by: "Dra.", assignedAt: "2026-10-01" },
      { id: "2", kind: "plan" as const, by: "Dra.", assignedAt: "2026-10-01", doneRecordId: "x" },
    ];
    expect(pendingAssignments(list).map((a) => a.id)).toEqual(["1"]);
  });
});
