import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IslandPanel } from "@/features/garden/island/IslandPanel";

const base = {
  foxName: "",
  plants: [{ kind: "sunflower" as const, growth: 0.6 }],
  available: 0,
  pouring: false,
  onPour: () => {},
  onClose: () => {},
};

describe("cartão do lugar na ilha", () => {
  it("o farol mostra o CVV e leva ao plano de segurança", () => {
    render(<IslandPanel {...base} place="farol" />);
    expect(screen.getByRole("link", { name: /CVV · 188/ })).toHaveAttribute("href", "tel:188");
    expect(screen.getByRole("link", { name: "Abrir meu plano de segurança" })).toHaveAttribute(
      "href",
      "/dashboard/safety",
    );
  });

  it("a cabana leva ao diário", () => {
    render(<IslandPanel {...base} place="cabana" />);
    expect(screen.getByRole("link", { name: "Abrir cabana" })).toHaveAttribute("href", "/dashboard/diary");
  });

  it("o cais usa o nome da raposa", () => {
    render(<IslandPanel {...base} place="cais" foxName="Mel" />);
    expect(screen.getByRole("link", { name: "Respirar com a Mel" })).toHaveAttribute(
      "href",
      "/dashboard/breathing",
    );
  });

  it("no cais, dá para sair de barco respirando, ou ir para a respiração completa", async () => {
    const onStartTrip = vi.fn();
    render(<IslandPanel {...base} place="cais" foxName="Mel" onStartTrip={onStartTrip} />);
    await userEvent.click(screen.getByRole("button", { name: /5 respirações/ }));
    expect(onStartTrip).toHaveBeenCalledWith(5);
    expect(screen.getByRole("link", { name: "Mais exercícios de respiração" })).toHaveAttribute(
      "href",
      "/dashboard/breathing",
    );
  });

  it("nos canteiros, regar só funciona com gotas", async () => {
    const onPour = vi.fn();
    const { rerender } = render(<IslandPanel {...base} place="canteiros" onPour={onPour} />);
    expect(screen.getByRole("button", { name: "Sem gotas para regar" })).toBeDisabled();

    rerender(<IslandPanel {...base} place="canteiros" available={2} onPour={onPour} />);
    await userEvent.click(screen.getByRole("button", { name: "Regar (2)" }));
    expect(onPour).toHaveBeenCalledOnce();
    expect(screen.getByText("Girassol · 60%")).toBeInTheDocument();
  });

  it("nos canteiros, mostra quantas gotas faltam para a próxima planta", () => {
    render(<IslandPanel {...base} place="canteiros" toNext={4} />);
    const beds = screen.getByRole("list", { name: "Plantas" });
    expect(beds.children).toHaveLength(4);
    expect(screen.getByText("Margarida nasce em 4 gotas")).toBeInTheDocument();
  });

  it("fecha pelo botão", async () => {
    const onClose = vi.fn();
    render(<IslandPanel {...base} place="garrafa" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
