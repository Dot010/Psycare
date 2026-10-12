import { describe, expect, it } from "vitest";
import { contactSchema } from "./schema";

const message = (input: object) => {
  const r = contactSchema.safeParse(input);
  return r.success ? null : r.error.issues[0]?.message;
};

describe("contactSchema", () => {
  it("aceita nome, quem é e telefone com DDD", () => {
    const r = contactSchema.safeParse({ name: "  Maria   Souza ", role: "irmã", phone: "(11) 91234-5678" });
    expect(r.success && r.data.name).toBe("Maria Souza");
  });

  it("pede o nome e confere o telefone", () => {
    expect(message({ name: " ", role: "", phone: "11912345678" })).toBe("Escreva o nome.");
    expect(message({ name: "Maria", role: "", phone: "123" })).toBe("Confira o telefone, com DDD.");
  });

  it("avisa em português quando passa do limite", () => {
    expect(message({ name: "a".repeat(61), role: "", phone: "11912345678" })).toBe("Use até 60 caracteres");
    expect(message({ name: "Maria", role: "a".repeat(41), phone: "11912345678" })).toBe(
      "Use até 40 caracteres",
    );
  });
});
