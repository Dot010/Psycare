import { describe, expect, it } from "vitest";
import { exameSchema, HEALTH_LIMITS, medicamentoSchema, sintomaSchema } from "./schema";

const message = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.error?.issues[0]?.message;

describe("medicamentoSchema", () => {
  it("aceita um remédio simples e tira espaços das pontas", () => {
    const r = medicamentoSchema.safeParse({ nome: "  Sertralina ", dosagem: "50 mg" });
    expect(r.success && r.data.nome).toBe("Sertralina");
  });

  it("pede nome e dosagem", () => {
    expect(message(medicamentoSchema.safeParse({ nome: "", dosagem: "50 mg" }))).toBe(
      "Informe o nome do remédio",
    );
    expect(message(medicamentoSchema.safeParse({ nome: "Sertralina", dosagem: " " }))).toBe(
      "Informe a dosagem",
    );
  });

  it("avisa em português quando passa do limite", () => {
    const r = medicamentoSchema.safeParse({ nome: "a".repeat(HEALTH_LIMITS.medNome + 1), dosagem: "1" });
    expect(message(r)).toBe(`Use até ${HEALTH_LIMITS.medNome} caracteres`);
  });
});

describe("sintomaSchema", () => {
  it("aceita um sintoma com data real", () => {
    expect(sintomaSchema.safeParse({ descricao: "Insônia", data: "2026-10-12" }).success).toBe(true);
  });

  it("recusa data que não existe", () => {
    expect(message(sintomaSchema.safeParse({ descricao: "Insônia", data: "2026-02-31" }))).toBe(
      "Escolha uma data",
    );
    expect(message(sintomaSchema.safeParse({ descricao: "Insônia", data: "12/10/2026" }))).toBe(
      "Escolha uma data",
    );
  });

  it("limita a descrição e a observação", () => {
    expect(
      sintomaSchema.safeParse({
        descricao: "a".repeat(HEALTH_LIMITS.sintomaDescricao + 1),
        data: "2026-10-12",
      }).success,
    ).toBe(false);
    expect(
      sintomaSchema.safeParse({
        descricao: "Dor",
        nota: "a".repeat(HEALTH_LIMITS.sintomaNota + 1),
        data: "2026-10-12",
      }).success,
    ).toBe(false);
  });
});

describe("exameSchema", () => {
  it("aceita exame com resultado opcional", () => {
    expect(exameSchema.safeParse({ titulo: "Hemograma", data: "2026-10-01" }).success).toBe(true);
    expect(
      exameSchema.safeParse({ titulo: "Hemograma", data: "2026-10-01", resultado: "Normal" }).success,
    ).toBe(true);
  });

  it("pede nome e data válida", () => {
    expect(message(exameSchema.safeParse({ titulo: "H", data: "2026-10-01" }))).toBe("Dê um nome ao exame.");
    expect(message(exameSchema.safeParse({ titulo: "Hemograma", data: "" }))).toBe(
      "Escolha a data do exame.",
    );
  });

  it("deixa o resultado ter até 300 caracteres e recusa mais que isso", () => {
    const base = { titulo: "Hemograma", data: "2026-10-01" };
    expect(exameSchema.safeParse({ ...base, resultado: "a".repeat(300) }).success).toBe(true);
    expect(exameSchema.safeParse({ ...base, resultado: "a".repeat(301) }).success).toBe(false);
  });
});
