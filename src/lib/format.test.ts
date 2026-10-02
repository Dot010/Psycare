import { describe, expect, it } from "vitest";
import { formatCurrencyBRL, formatDateBR } from "./format";

describe("formatDateBR", () => {
  it("converte a data ISO do input para dd/mm/aaaa", () => {
    expect(formatDateBR("2026-09-20")).toBe("20/09/2026");
  });

  it("não mexe em valores que já estão formatados ou vazios", () => {
    expect(formatDateBR("08/09/2026")).toBe("08/09/2026");
    expect(formatDateBR("")).toBe("");
  });
});

describe("formatCurrencyBRL", () => {
  it("formata em reais", () => {
    expect(formatCurrencyBRL(49.9).replace(/\s/g, " ")).toBe("R$ 49,90");
  });
});
