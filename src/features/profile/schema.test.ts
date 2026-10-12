import { describe, expect, it } from "vitest";
import { ageOn, greeting, patientDisplayName } from "./logic";
import { NAME_MAX, parseProfile } from "./schema";

const TODAY = "2026-10-12";

describe("parseProfile", () => {
  it("aceita tudo vazio (os dois campos são opcionais)", () => {
    expect(parseProfile({ name: "", birthDate: "" }, TODAY)).toEqual({ ok: true, profile: { name: "" } });
  });

  it("limpa espaços e guarda a data", () => {
    expect(parseProfile({ name: "  Marina ", birthDate: "1990-05-17" }, TODAY)).toEqual({
      ok: true,
      profile: { name: "Marina", birthDate: "1990-05-17" },
    });
  });

  it("recusa nome longo demais, em português", () => {
    const r = parseProfile({ name: "a".repeat(NAME_MAX + 1), birthDate: "" }, TODAY);
    expect(r).toEqual({ ok: false, errors: { name: `O nome passa de ${NAME_MAX} caracteres` } });
  });

  it("recusa data que não existe, futura ou antes de 1900", () => {
    const msg = (birthDate: string) => {
      const r = parseProfile({ name: "", birthDate }, TODAY);
      return r.ok ? null : r.errors.birthDate;
    };
    expect(msg("1990-02-31")).toBe("Escolha uma data válida");
    expect(msg("abc")).toBe("Escolha uma data válida");
    expect(msg("2026-10-13")).toBe("A data não pode ser no futuro");
    expect(msg("1899-12-31")).toBe("Escolha uma data a partir de 1900");
    expect(msg("2026-10-12")).toBeNull();
    expect(msg("1900-01-01")).toBeNull();
  });
});

describe("profile logic", () => {
  it("cumprimenta só com 'Olá!' quando não há nome", () => {
    expect(greeting({ name: "" })).toBe("Olá!");
    expect(greeting({ name: "   " })).toBe("Olá!");
    expect(greeting({ name: "Marina" })).toBe("Olá, Marina");
  });

  it("calcula a idade completa só se houver data", () => {
    expect(ageOn({ name: "", birthDate: "1990-10-12" }, TODAY)).toBe(36);
    expect(ageOn({ name: "", birthDate: "1990-10-13" }, TODAY)).toBe(35);
    expect(ageOn({ name: "", birthDate: "1990-12-01" }, TODAY)).toBe(35);
    expect(ageOn({ name: "" }, TODAY)).toBeUndefined();
  });

  it("usa um nome neutro para o profissional quando a pessoa pulou", () => {
    expect(patientDisplayName({ name: "" })).toBe("Paciente demo");
    expect(patientDisplayName({ name: "Marina" })).toBe("Marina");
  });
});
