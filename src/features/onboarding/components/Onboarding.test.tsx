import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { PROFILE_KEY } from "@/features/profile/schema";
import { Onboarding } from "./Onboarding";

const saved = () => {
  const raw = window.localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
};

async function goToProfileStep() {
  render(<Onboarding />);
  await userEvent.click(await screen.findByRole("button", { name: "Continuar" }));
}

describe("Onboarding: nome e ano", () => {
  beforeEach(() => window.localStorage.clear());

  it("os campos começam vazios e avisam que podem ser fictícios", async () => {
    await goToProfileStep();
    expect(screen.getByLabelText("Nome ou apelido")).toHaveValue("");
    expect(screen.getByLabelText("Ano de nascimento")).toHaveValue("");
    expect(screen.getByText(/Pode ser fictício na demonstração/)).toBeInTheDocument();
  });

  it("'Pular' segue em frente sem guardar nada", async () => {
    await goToProfileStep();
    await userEvent.click(screen.getByRole("button", { name: "Pular" }));
    expect(screen.getByText("O que você quer cuidar primeiro?")).toBeInTheDocument();
    expect(saved()).toBeNull();
  });

  it("guarda nome e ano quando preenchidos", async () => {
    await goToProfileStep();
    await userEvent.type(screen.getByLabelText("Nome ou apelido"), "Mari");
    await userEvent.type(screen.getByLabelText("Ano de nascimento"), "1990");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(saved()).toEqual({ name: "Mari", birthYear: 1990 });
  });

  it("avisa em português quando o ano não vale e não avança", async () => {
    await goToProfileStep();
    await userEvent.type(screen.getByLabelText("Ano de nascimento"), "199");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Use 4 dígitos, por exemplo 1990");
    expect(screen.queryByText("O que você quer cuidar primeiro?")).toBeNull();
  });
});
