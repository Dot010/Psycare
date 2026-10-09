import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import PrescriptionsView from "./PrescriptionsView";

describe("PrescriptionsView", () => {
  beforeEach(() => window.localStorage.clear());

  it("mostra primeiro a receita vencida e depois as que vencem logo", () => {
    render(<PrescriptionsView />);
    const names = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(names.slice(0, 3)).toEqual(["Fluoxetina", "Clonazepam", "Sertralina"]);
    expect(screen.getByText(/Vencida há 2 dias/)).toBeInTheDocument();
    expect(screen.getByText(/Vence em 3 dias/)).toBeInTheDocument();
  });

  it("renovar é simulado, muda a validade e avisa que nada foi emitido", async () => {
    render(<PrescriptionsView />);
    const card = screen.getByRole("heading", { name: "Fluoxetina" }).closest("li") as HTMLElement;
    await userEvent.click(within(card).getByRole("button", { name: "Renovar" }));
    expect(within(card).getByText("Válida")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/renovação simulada/);
  });

  it("suspender tira os botões da receita", async () => {
    render(<PrescriptionsView />);
    const card = screen.getByRole("heading", { name: "Clonazepam" }).closest("li") as HTMLElement;
    await userEvent.click(within(card).getByRole("button", { name: "Suspender" }));
    expect(within(card).getByText("Suspensa")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: "Renovar" })).not.toBeInTheDocument();
  });
});
