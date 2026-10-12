import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import ClinicalView, { clinicalTabFrom } from "./ClinicalView";
import ProDashboard from "./ProDashboard";

beforeEach(() => localStorage.clear());

const wrap = (ui: React.ReactNode) => render(<UndoProvider>{ui}</UndoProvider>);

describe("Clínico", () => {
  it("reúne Receitas, Exames, Encaminhamentos e Adesão em abas", async () => {
    wrap(<ClinicalView />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual([
      "Receitas",
      "Exames",
      "Encaminhamentos",
      "Adesão",
    ]);
    expect(screen.getByRole("heading", { level: 1, name: "Clínico" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Exames" }));
    expect(screen.getByRole("heading", { level: 2, name: "Exames" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Encaminhamentos" }));
    expect(screen.getByRole("heading", { level: 2, name: "Encaminhamentos" })).toBeInTheDocument();
  });

  it("uma aba desconhecida cai em Receitas", () => {
    expect(clinicalTabFrom("xyz")).toBe("receitas");
    expect(clinicalTabFrom("exames")).toBe("exames");
  });
});

describe("Painel do psiquiatra: Pedidos", () => {
  it("lista os pedidos de receita e de encaminhamento em um lugar só", () => {
    wrap(<ProDashboard specialty="psychiatrist" />);
    expect(screen.getByText(/pedidos esperam você/)).toBeInTheDocument();
    expect(screen.getByText(/pediu nova receita de Lyberdia/)).toBeInTheDocument();
    expect(screen.getByText(/pediu encaminhamento para a psicóloga/)).toBeInTheDocument();
  });

  it("a psicóloga não vê essa caixa", () => {
    wrap(<ProDashboard specialty="psychologist" />);
    expect(screen.queryByText(/pedidos esperam você/)).not.toBeInTheDocument();
  });
});
