import { describe, expect, it } from "vitest";
import { advanceLabel, nextStep, renewedUntil } from "./exams";

describe("exames", () => {
  it("cada etapa leva à seguinte e para no resultado", () => {
    expect(nextStep(1)).toBe(2);
    expect(nextStep(2)).toBe(3);
    expect(nextStep(3)).toBe(3);
  });

  it("só oferece avançar enquanto não há resultado", () => {
    expect(advanceLabel(1)).toBe("Marcar como coletado");
    expect(advanceLabel(2)).toBe("Registrar resultado");
    expect(advanceLabel(3)).toBeNull();
  });
});

describe("renewedUntil", () => {
  it("soma 90 dias por padrão, atravessando o mês", () => {
    expect(renewedUntil("2026-10-09")).toBe("2027-01-07");
  });
  it("aceita outro prazo", () => {
    expect(renewedUntil("2026-10-09", 30)).toBe("2026-11-08");
  });
});
