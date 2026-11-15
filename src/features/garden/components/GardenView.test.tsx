import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GardenView from "./GardenView";

beforeEach(() => {
  localStorage.clear();
  // Sem WebGL no jsdom: a ilha mostra o desenho de reserva, e o resto da tela funciona igual.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

describe("Refúgio em tela cheia", () => {
  it("cobre a tela, com intro que dá para pular", async () => {
    render(<GardenView />);
    const refuge = screen.getByRole("region", { name: "Seu refúgio" });
    expect(refuge).toHaveClass("fixed", "inset-0");
    expect(within(refuge).getByText("Um lugar só seu, no seu tempo.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /pular/i }));
    expect(screen.queryByRole("button", { name: /pular/i })).not.toBeInTheDocument();
  });

  it("mantém sair, ajuda e os lugares sempre à mão", () => {
    render(<GardenView />);
    expect(screen.getByRole("link", { name: "Sair do refúgio" })).toHaveAttribute("href", "/dashboard/home");
    expect(screen.getByRole("button", { name: "Preciso de ajuda agora" })).toBeInTheDocument();
    const places = screen.getByRole("navigation", { name: "Lugares da ilha" });
    expect(within(places).getByRole("button", { name: "Canteiros" })).toBeInTheDocument();
  });

  it("o botão de gotas mostra de onde elas vêm", async () => {
    render(<GardenView />);
    await userEvent.click(screen.getByRole("button", { name: /0 gotas/i }));
    const dialog = await screen.findByRole("dialog", { name: "Suas gotas" });
    expect(within(dialog).getByRole("link", { name: /Escrever no diário/ })).toHaveAttribute(
      "href",
      "/dashboard/diary",
    );
  });

  it("o som começa desligado e o botão liga", async () => {
    render(<GardenView />);
    await userEvent.click(screen.getByRole("button", { name: "Ligar o som" }));
    expect(screen.getByRole("button", { name: "Desligar o som" })).toHaveAttribute("aria-pressed", "true");
  });
});
