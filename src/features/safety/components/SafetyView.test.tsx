import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import SafetyView from "./SafetyView";

beforeEach(() => localStorage.clear());

const step = (name: RegExp) => screen.getByRole("button", { name });

describe("Plano de segurança em passos", () => {
  it("os telefones de emergência estão sempre à mão", () => {
    render(<SafetyView />);
    const ajuda = screen.getByRole("region", { name: "Em perigo agora?" });

    expect(within(ajuda).getByRole("link", { name: /Ligar 188/ })).toHaveAttribute("href", "tel:188");
    expect(within(ajuda).getByRole("link", { name: /Ligar 192/ })).toHaveAttribute("href", "tel:192");
  });

  it("começa no primeiro passo vazio, e escrever nele conta no progresso", async () => {
    render(<SafetyView />);

    expect(screen.getByText("0 de 5")).toBeInTheDocument();
    expect(step(/Sinais de que não estou bem/)).toHaveAttribute("aria-expanded", "true");

    await userEvent.type(screen.getByLabelText("Adicionar em Sinais de que não estou bem"), "durmo pouco");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByText("1 de 5")).toBeInTheDocument();
    expect(step(/Sinais de que não estou bem.*\(preenchido\)/)).toBeInTheDocument();
  });

  it("dá para abrir outro passo, e um só fica aberto", async () => {
    render(<SafetyView />);

    await userEvent.click(step(/Pessoas de confiança/));

    expect(step(/Pessoas de confiança/)).toHaveAttribute("aria-expanded", "true");
    expect(step(/Sinais de que não estou bem/)).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByLabelText("Telefone com DDD")).toBeInTheDocument();
  });
});
