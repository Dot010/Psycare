import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActivityForm } from "./ActivityForm";

describe("ActivityForm", () => {
  it("não guarda sem os campos obrigatórios e mostra o que falta", async () => {
    const onSave = vi.fn();
    render(<ActivityForm kind="plan" onCancel={() => {}} onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });

  it("guarda as respostas limpas e a anotação", async () => {
    const onSave = vi.fn();
    render(<ActivityForm kind="plan" onCancel={() => {}} onSave={onSave} />);
    await userEvent.type(screen.getByLabelText("O que eu quero mudar ou alcançar?"), "  Caminhar mais ");
    await userEvent.type(screen.getByLabelText("Qual é o primeiro passo, bem pequeno?"), "Calçar o tênis");
    await userEvent.type(screen.getByLabelText(/Uma anotação para o futuro/), "Fase corrida");
    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(onSave).toHaveBeenCalledWith({ goal: "Caminhar mais", step: "Calçar o tênis" }, "Fase corrida");
  });

  it("escala da roda: escolhe uma nota por área", async () => {
    const onSave = vi.fn();
    render(<ActivityForm kind="wheel" onCancel={() => {}} onSave={onSave} />);
    const saude = screen.getByRole("radiogroup", { name: "Saúde" });
    await userEvent.click(saude.querySelectorAll("button")[6]);
    expect(saude.querySelector("[aria-checked=true]")?.textContent).toBe("7");
  });
});
