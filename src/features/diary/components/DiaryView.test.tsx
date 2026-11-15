import { fireEvent, render, screen, within } from "@testing-library/react";
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
  it("abre com o calendário do mês e as abas", () => {
    setup();
    expect(screen.getByRole("region", { name: "Seu mês" })).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Seções do diário" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próximo mês" })).toBeDisabled();
  });

  it("uma página guardada pinta o dia no calendário e aparece ao tocar nele", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/Escreva do seu jeito/), "Hoje foi um dia tranquilo no trabalho");
    await user.click(screen.getByRole("button", { name: "Guardar página" }));

    const day = new Date().getDate();
    const cell = screen.getByRole("button", { name: new RegExp(`^${day} de .*: mais ou menos, 1 página$`) });
    await user.click(cell);
    expect(cell).toHaveAttribute("aria-pressed", "true");
    expect(
      within(screen.getByRole("region", { name: "Seu mês" })).getByText(/Hoje foi um dia tranquilo/),
    ).toBeInTheDocument();
  });

  it("o que vai para a sessão aparece ao lado", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/Escreva do seu jeito/), "Quero falar da briga com a minha mãe");
    await user.click(screen.getByRole("checkbox", { name: /sessão|consulta/i }));
    await user.click(screen.getByRole("button", { name: "Guardar página" }));

    const box = screen.getByRole("region", { name: "Vai para a sessão" });
    expect(within(box).getByText(/briga com a minha mãe/)).toBeInTheDocument();
  });

  it("pede um pouco mais de texto antes de guardar", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/Escreva do seu jeito/), "oi");
    await user.click(screen.getByRole("button", { name: "Guardar página" }));
    expect(screen.getByText(/Escreva um pouco mais/)).toBeInTheDocument();
  });

  it("guarda uma página escrita e ela aparece em Páginas", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText(/Escreva do seu jeito/), "Hoje foi um dia tranquilo no trabalho");
    await user.click(screen.getByRole("button", { name: "Guardar página" }));
    expect(screen.getByText(/Página guardada/)).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Páginas" }));
    expect(screen.getAllByText(/Hoje foi um dia tranquilo/).length).toBeGreaterThan(0);
  });

  it("guarda um desenho e mostra a imagem em Páginas", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "Desenhar" }));
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

  it("o Diário tem 3 abas: Escrever, Páginas e Humor", () => {
    setup();
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Escrever", "Páginas", "Humor"]);
  });

  it("a aba Humor mostra o humor dentro do Diário", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("tab", { name: "Humor" }));
    expect(screen.getByText("Seu humor, sem pressa")).toBeInTheDocument();
  });
});
