import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import ExamsView from "./ExamsView";

describe("ExamsView", () => {
  beforeEach(() => window.localStorage.clear());

  it("começa com um exame em cada etapa e o resultado primeiro", () => {
    render(<ExamsView />);
    const names = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(names).toEqual(["Hemograma", "TSH", "Glicemia"]);
  });

  it("avançar leva a coletado e depois ao resultado", async () => {
    render(<ExamsView />);
    const card = screen.getByRole("heading", { name: "Glicemia" }).closest("li") as HTMLElement;
    await userEvent.click(within(card).getByRole("button", { name: "Marcar como coletado" }));
    expect(within(card).getByText("Coletado")).toBeInTheDocument();
    await userEvent.click(within(card).getByRole("button", { name: "Registrar resultado" }));
    expect(within(card).getByText("Resultado chegou")).toBeInTheDocument();
    expect(within(card).queryByRole("button")).not.toBeInTheDocument();
  });

  it("pede um exame novo escolhendo na lista", async () => {
    render(<ExamsView />);
    await userEvent.click(screen.getByRole("button", { name: "Pedir exame" }));
    const submit = screen.getByRole("button", { name: "Pedir (simulado)" });
    expect(submit).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Vitamina D" }));
    await userEvent.click(submit);
    expect(screen.getByRole("heading", { name: "Vitamina D" })).toBeInTheDocument();
  });
});
