import { describe, expect, it } from "vitest";
import {
  cycleDuration,
  formatClock,
  phaseAt,
  scaleForPhase,
  SCALE_EMPTY,
  SCALE_FULL,
  TECHNIQUES,
} from "./techniques";

const byId = (id: string) => TECHNIQUES.find((t) => t.id === id)!;

describe("cycleDuration", () => {
  it("soma as fases de cada técnica", () => {
    expect(cycleDuration(byId("calm"))).toBe(10);
    expect(cycleDuration(byId("box"))).toBe(16);
    expect(cycleDuration(byId("478"))).toBe(19);
  });
});

describe("phaseAt", () => {
  const box = byId("box");

  it("começa inspirando, com contagem regressiva", () => {
    expect(phaseAt(box, 0)).toMatchObject({ index: 0, remaining: 4, cycle: 1 });
    expect(phaseAt(box, 0.5).remaining).toBe(4);
    expect(phaseAt(box, 3.2).remaining).toBe(1);
  });

  it("troca de fase exatamente no limite", () => {
    expect(phaseAt(box, 3.999).phase.kind).toBe("inhale");
    expect(phaseAt(box, 4).phase.kind).toBe("hold-full");
    expect(phaseAt(box, 8).phase.kind).toBe("exhale");
    expect(phaseAt(box, 12).phase.kind).toBe("hold-empty");
  });

  it("reinicia o ciclo e incrementa o contador", () => {
    expect(phaseAt(box, 16)).toMatchObject({ index: 0, cycle: 2 });
    expect(phaseAt(box, 33)).toMatchObject({ index: 0, cycle: 3 });
  });

  it("trata tempo negativo como zero", () => {
    expect(phaseAt(box, -5)).toMatchObject({ index: 0, cycle: 1 });
  });

  it("a expiração do 4-7-8 dura 8 segundos", () => {
    const t = byId("478");
    expect(phaseAt(t, 11)).toMatchObject({ phase: { kind: "exhale" }, remaining: 8 });
  });
});

describe("scaleForPhase", () => {
  it("o blob cresce ao inspirar/segurar cheio e encolhe ao expirar/segurar vazio", () => {
    expect(scaleForPhase("inhale")).toBe(SCALE_FULL);
    expect(scaleForPhase("hold-full")).toBe(SCALE_FULL);
    expect(scaleForPhase("exhale")).toBe(SCALE_EMPTY);
    expect(scaleForPhase("hold-empty")).toBe(SCALE_EMPTY);
  });
});

describe("formatClock", () => {
  it("formata minutos e segundos", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(179.2)).toBe("3:00");
  });
});
