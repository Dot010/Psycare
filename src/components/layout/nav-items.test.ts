import { describe, expect, it } from "vitest";
import { navItemsFor } from "./nav-items";

const titles = (variant: Parameters<typeof navItemsFor>[0]) => navItemsFor(variant).map((i) => i.title);

describe("navItemsFor", () => {
  it("o psiquiatra tem Receitas, Exames e Medicação, e não tem Atividades", () => {
    const t = titles("psychiatrist");
    expect(t).toEqual(expect.arrayContaining(["Receitas", "Exames", "Medicação"]));
    expect(t).not.toContain("Atividades");
  });

  it("a psicóloga tem Atividades, e não tem Receitas nem Exames", () => {
    const t = titles("psychologist");
    expect(t).toContain("Atividades");
    expect(t).not.toContain("Receitas");
    expect(t).not.toContain("Exames");
  });
});
