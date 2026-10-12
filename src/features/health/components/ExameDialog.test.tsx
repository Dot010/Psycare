import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExameDialog } from "./ExameDialog";

function setup() {
  const onSave = vi.fn();
  render(<ExameDialog open onOpenChange={() => {}} onSave={onSave} />);
  return { onSave, user: userEvent.setup() };
}

describe("ExameDialog", () => {
  it("guarda o exame com nome, data e resultado", async () => {
    const { onSave, user } = setup();
    await user.type(screen.getByLabelText("Nome do exame"), "Hemograma");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ titulo: "Hemograma" }));
  });

  it("não deixa salvar sem nome e mostra o aviso", async () => {
    const { onSave, user } = setup();
    await user.type(screen.getByLabelText("Nome do exame"), "H");
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Dê um nome ao exame.");
  });

  it("aceita um resultado de até 300 caracteres (não corta em 200)", async () => {
    const { onSave, user } = setup();
    await user.type(screen.getByLabelText("Nome do exame"), "Hemograma");
    await user.click(screen.getByLabelText(/O que o exame mostrou/));
    await user.paste("a".repeat(250));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSave.mock.calls[0][0].resultado).toHaveLength(250);
  });
});
