import { describe, expect, it } from "vitest";
import { navItemsFor } from "./nav-items";

const titles = (variant: Parameters<typeof navItemsFor>[0]) => navItemsFor(variant).map((i) => i.title);

describe("navItemsFor", () => {
  it("o psiquiatra tem uma tela Clínico no lugar de Receitas, Exames, Encaminhamentos e Medicação", () => {
    const t = titles("psychiatrist");
    expect(t).toEqual([
      "Painel do dia",
      "Pacientes",
      "Agenda",
      "Clínico",
      "Mensagens",
      "Financeiro",
      "Configurações",
    ]);
  });

  it("a psicóloga tem Atividades, e não tem Receitas nem Exames", () => {
    const t = titles("psychologist");
    expect(t).toContain("Atividades");
    expect(t).not.toContain("Receitas");
    expect(t).not.toContain("Encaminhamentos");
    expect(t).not.toContain("Exames");
  });

  it("o paciente tem 5 abas na barra do celular: Início, Meu dia, Diário, Atividades e Saúde", () => {
    const bar = navItemsFor("patient")
      .filter((i) => i.inMobileBar)
      .map((i) => i.shortTitle ?? i.title);
    expect(bar).toEqual(["Início", "Meu dia", "Diário", "Atividades", "Saúde"]);
  });

  it("os atalhos antigos continuam no menu, fora da barra", () => {
    const titles = navItemsFor("patient").map((i) => i.title);
    expect(titles).toEqual(expect.arrayContaining(["Consultas", "Mensagens"]));
  });

  it("o menu do paciente usa um nome por tela e Atividades fica em /dashboard/activities", () => {
    const items = navItemsFor("patient");
    expect(items.map((i) => i.title)).toEqual(
      expect.arrayContaining(["Diário", "Saúde", "Consultas", "Pagamentos", "Plano de segurança"]),
    );
    expect(items.find((i) => i.title === "Atividades")?.href).toBe("/dashboard/activities");
  });
});
