import { describe, expect, it } from "vitest";
import { adherence, daysUntil, prescriptionStatus } from "./prescriptions";

describe("daysUntil", () => {
  it("conta os dias entre duas datas", () => {
    expect(daysUntil("2026-10-21", "2026-10-09")).toBe(12);
  });
  it("é zero no mesmo dia e negativo se já passou", () => {
    expect(daysUntil("2026-10-09", "2026-10-09")).toBe(0);
    expect(daysUntil("2026-10-07", "2026-10-09")).toBe(-2);
  });
});

describe("prescriptionStatus", () => {
  it("vencida quando faltam menos de zero dias", () => {
    expect(prescriptionStatus(-1)).toBe("expired");
  });
  it("vencendo de 0 a 5 dias", () => {
    expect(prescriptionStatus(0)).toBe("expiring");
    expect(prescriptionStatus(5)).toBe("expiring");
  });
  it("válida com mais de 5 dias", () => {
    expect(prescriptionStatus(6)).toBe("valid");
  });
});

describe("adherence", () => {
  it("devolve a porcentagem arredondada", () => {
    expect(adherence(5, 7)).toBe(71);
    expect(adherence(7, 7)).toBe(100);
  });
  it("devolve null quando não havia doses previstas", () => {
    expect(adherence(0, 0)).toBeNull();
  });
});
