import { describe, expect, it } from "vitest";
import { createAppointmentSchema, PROFISSIONAL_MAX } from "./types";

const base = { profissional: "Dra. Ana Silva", data: "2026-10-20", hora: "14:30", tipo: "online" as const };
const message = (input: object) => {
  const r = createAppointmentSchema.safeParse(input);
  return r.success ? null : r.error.issues[0]?.message;
};

describe("createAppointmentSchema", () => {
  it("aceita uma consulta completa e tira espaços do nome", () => {
    const r = createAppointmentSchema.safeParse({ ...base, profissional: "  Dra. Ana Silva " });
    expect(r.success && r.data.profissional).toBe("Dra. Ana Silva");
  });

  it("recusa nome só com espaços", () => {
    expect(message({ ...base, profissional: "   " })).toBe("Informe o profissional");
  });

  it("limita o nome com aviso em português", () => {
    expect(message({ ...base, profissional: "a".repeat(PROFISSIONAL_MAX + 1) })).toBe(
      "Use até 80 caracteres",
    );
  });

  it("recusa data e hora que não existem", () => {
    expect(message({ ...base, data: "" })).toBe("Informe a data");
    expect(message({ ...base, data: "2026-02-31" })).toBe("Escolha uma data válida");
    expect(message({ ...base, hora: "" })).toBe("Informe o horário");
    expect(message({ ...base, hora: "25:00" })).toBe("Escolha um horário válido");
  });
});
