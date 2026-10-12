import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import PlannerView from "@/features/planner/components/PlannerView";

beforeEach(() => {
  localStorage.clear();
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as typeof window.matchMedia;
});

describe("Hábitos dentro do Meu dia", () => {
  it("a aba Hábitos mostra o resumo e deixa concluir um hábito", async () => {
    render(
      <UndoProvider>
        <PlannerView />
      </UndoProvider>,
    );
    await userEvent.click(screen.getByRole("tab", { name: "Hábitos" }));
    expect(screen.getByText("Concluídos hoje")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo hábito" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Concluir Treinar 2 horas" }));
    expect(screen.getByRole("button", { name: "Desmarcar Treinar 2 horas" })).toBeInTheDocument();
  });
});
