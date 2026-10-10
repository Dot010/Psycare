import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import DiaryView from "./DiaryView";

function setup() {
  return render(
    <UndoProvider>
      <DiaryView />
    </UndoProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  const ctx = {
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/webp;base64,AAAA");
});

describe("Diário novo", () => {
  it("começa fechado e abre ao tocar na capa", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Abrir o diário" }));
    expect(screen.getByRole("tablist", { name: "Seções do diário" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fechar o diário" }));
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("pede um pouco mais de texto antes de guardar", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Abrir o diário" }));
    await user.type(screen.getByLabelText(/Escreva do seu jeito/), "oi");
    await user.click(screen.getByRole("button", { name: "Guardar página" }));
    expect(screen.getByText(/Escreva um pouco mais/)).toBeInTheDocument();
  });

  it("guarda uma página escrita e ela aparece em Páginas", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Abrir o diário" }));
    await user.type(screen.getByLabelText(/Escreva do seu jeito/), "Hoje foi um dia tranquilo no trabalho");
    await user.click(screen.getByRole("button", { name: "Guardar página" }));
    expect(screen.getByText(/Página guardada/)).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Páginas" }));
    expect(screen.getAllByText(/Hoje foi um dia tranquilo/).length).toBeGreaterThan(0);
  });

  it("guarda um desenho e mostra a imagem em Páginas", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Abrir o diário" }));
    await user.click(screen.getByRole("tab", { name: "Desenho" }));
    expect(screen.getByRole("button", { name: "Guardar desenho" })).toBeDisabled();
    const area = screen.getByRole("img", { name: "Área de desenho" });
    fireEvent.pointerDown(area, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(area, { clientX: 40, clientY: 30, pointerId: 1 });
    fireEvent.pointerUp(area, { pointerId: 1 });
    await user.type(screen.getByLabelText(/Nome do desenho/), "Meu sol");
    await user.click(screen.getByRole("button", { name: "Guardar desenho" }));
    await user.click(screen.getByRole("tab", { name: "Páginas" }));
    expect(screen.getByRole("img", { name: /Desenho: / })).toHaveAttribute(
      "src",
      "data:image/webp;base64,AAAA",
    );
  });

  it("a aba Semana mostra os sete dias", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Abrir o diário" }));
    await user.click(screen.getByRole("tab", { name: "Semana" }));
    expect(screen.getAllByRole("button", { name: /\d\d\/\d\d, \d+ página/ })).toHaveLength(7);
  });
});
