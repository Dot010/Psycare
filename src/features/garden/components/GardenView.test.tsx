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

    await userEvent.click(screen.getByRole("button", { name: /Seu refúgio.*Pular/ }));
    // A intro some (fica escondida para o leitor de tela enquanto apaga).
    expect(screen.queryByRole("button", { name: /Seu refúgio.*Pular/ })).not.toBeInTheDocument();
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

  it("no cais, sai de barco respirando e dá para parar", async () => {
    render(<GardenView />);
    const places = screen.getByRole("navigation", { name: "Lugares da ilha" });
    await userEvent.click(within(places).getByRole("button", { name: "Cais" }));
    await userEvent.click(screen.getByRole("button", { name: /3 respirações/ }));
    expect(screen.getByText("Respiração 1 de 3")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Caminho até a ilhota" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Parar e voltar" }));
    expect(screen.queryByText("Respiração 1 de 3")).not.toBeInTheDocument();
  });
});

/** Pula a intro e o passeio da primeira visita. */
async function enter() {
  render(<GardenView />);
  await userEvent.click(screen.getByRole("button", { name: /Seu refúgio.*Pular/ }));
  await userEvent.click(await screen.findByRole("button", { name: "Pular" }));
}
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "null");
const openPlace = async (name: string) =>
  userEvent.click(
    within(screen.getByRole("navigation", { name: "Lugares da ilha" })).getByRole("button", { name }),
  );

describe("Atividades da ilha", () => {
  it("na primeira visita, a raposa mostra os lugares; depois, pergunta como você está", async () => {
    render(<GardenView />);
    await userEvent.click(screen.getByRole("button", { name: /Seu refúgio.*Pular/ }));
    expect(await screen.findByText(/Conhecendo a ilha · 1 de 6/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText(/2 de 6/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pular" }));
    expect(stored("psycare:island:tour:v1")).toBe(true);

    const ask = screen.getByRole("group", { name: "Como você está" });
    await userEvent.click(within(ask).getByRole("button", { name: "Bem" }));
    expect(stored("psycare:checkins:v1")[0]).toMatchObject({ level: 4 });
    expect(screen.queryByRole("group", { name: "Como você está" })).not.toBeInTheDocument();
  });

  it("na Cabana, uma coisa boa vira página do diário e uma lanterna", async () => {
    await enter();
    await openPlace("Cabana");
    await userEvent.type(screen.getByLabelText("Uma linha para o diário"), "O café com a minha irmã");
    await userEvent.click(screen.getByRole("checkbox", { name: /coisa boa de hoje/ }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar no diário" }));
    expect(stored("psycare:diary:v1")[0]).toMatchObject({
      content: "O café com a minha irmã",
      prompt: "Uma coisa boa de hoje",
    });
    expect(screen.getByRole("status")).toHaveTextContent(/lanterna/);
  });

  it("na Praia, jogar no mar não guarda nada; guardar leva para a sessão", async () => {
    await enter();
    await openPlace("Praia");
    await userEvent.type(screen.getByLabelText("O que está pesando?"), "Medo de perder o emprego");
    await userEvent.click(screen.getByRole("button", { name: "Jogar no mar" }));
    expect(stored("psycare:session-questions:v1")).toBeNull();
    await userEvent.type(screen.getByLabelText("O que está pesando?"), "Medo de perder o emprego");
    await userEvent.click(screen.getByRole("button", { name: "Guardar para a sessão" }));
    expect(stored("psycare:session-questions:v1")).toEqual(["Medo de perder o emprego"]);
  });

  it("no Farol, o 5-4-3-2-1 que ajudou entra no plano de segurança", async () => {
    await enter();
    await openPlace("Farol");
    await userEvent.click(screen.getByRole("button", { name: /Fazer o 5-4-3-2-1/ }));
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole("button", { name: "Próximo" }));
    await userEvent.click(screen.getByRole("button", { name: "Terminei" }));
    await userEvent.click(screen.getByRole("button", { name: "Ajudou" }));
    expect(stored("psycare:safety-plan:v1").coping).toEqual(["5-4-3-2-1 com a raposa"]);
  });
});
