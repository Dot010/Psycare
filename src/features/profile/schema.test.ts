import { describe, expect, it } from "vitest";
import { approxAge, greeting, patientDisplayName } from "./logic";
import { NAME_MAX, parseProfile } from "./schema";

const YEAR = 2026;

describe("parseProfile", () => {
  it("aceita tudo vazio (os dois campos são opcionais)", () => {
    expect(parseProfile({ name: "", birthYear: "" }, YEAR)).toEqual({ ok: true, profile: { name: "" } });
  });

  it("limpa espaços e converte o ano", () => {
    expect(parseProfile({ name: "  Marina ", birthYear: " 1990 " }, YEAR)).toEqual({
      ok: true,
      profile: { name: "Marina", birthYear: 1990 },
    });
  });

  it("recusa nome longo demais, em português", () => {
    const r = parseProfile({ name: "a".repeat(NAME_MAX + 1), birthYear: "" }, YEAR);
    expect(r).toEqual({ ok: false, errors: { name: `O nome passa de ${NAME_MAX} caracteres` } });
  });

  it("recusa ano que não tem 4 dígitos, no futuro ou antes de 1900", () => {
    const msg = (birthYear: string) => {
      const r = parseProfile({ name: "", birthYear }, YEAR);
      return r.ok ? null : r.errors.birthYear;
    };
    expect(msg("90")).toBe("Use 4 dígitos, por exemplo 1990");
    expect(msg("abcd")).toBe("Use 4 dígitos, por exemplo 1990");
    expect(msg("2027")).toBe("Escolha um ano entre 1900 e 2026");
    expect(msg("1899")).toBe("Escolha um ano entre 1900 e 2026");
    expect(msg("2026")).toBeNull();
  });
});

describe("profile logic", () => {
  it("cumprimenta só com 'Olá!' quando não há nome", () => {
    expect(greeting({ name: "" })).toBe("Olá!");
    expect(greeting({ name: "   " })).toBe("Olá!");
    expect(greeting({ name: "Marina" })).toBe("Olá, Marina");
  });

  it("calcula a idade aproximada só se houver ano", () => {
    expect(approxAge({ name: "", birthYear: 1990 }, YEAR)).toBe(36);
    expect(approxAge({ name: "" }, YEAR)).toBeUndefined();
  });

  it("usa um nome neutro para o profissional quando a pessoa pulou", () => {
    expect(patientDisplayName({ name: "" })).toBe("Paciente demo");
    expect(patientDisplayName({ name: "Marina" })).toBe("Marina");
  });
});
