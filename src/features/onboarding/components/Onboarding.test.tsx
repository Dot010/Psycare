import { fireEvent, render, screen } from "@testing-library/react";
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

describe("Onboarding: nome e data de nascimento", () => {
  beforeEach(() => window.localStorage.clear());

  it("os campos começam vazios e avisam que podem ser fictícios", async () => {
    await goToProfileStep();
    expect(screen.getByLabelText("Nome ou apelido")).toHaveValue("");
    expect(screen.getByLabelText("Data de nascimento")).toHaveValue("");
    expect(screen.getByText(/Pode ser fictício na demonstração/)).toBeInTheDocument();
  });

  it("'Pular' segue em frente sem guardar nada", async () => {
    await goToProfileStep();
    await userEvent.click(screen.getByRole("button", { name: "Pular" }));
    expect(screen.getByText("O que você quer cuidar primeiro?")).toBeInTheDocument();
    expect(saved()).toBeNull();
  });

  it("guarda nome e data quando preenchidos", async () => {
    await goToProfileStep();
    await userEvent.type(screen.getByLabelText("Nome ou apelido"), "Mari");
    fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: "1990-05-17" } });
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(saved()).toEqual({ name: "Mari", birthDate: "1990-05-17" });
  });

  it("avisa em português quando a data não vale e não avança", async () => {
    await goToProfileStep();
    fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: "2999-01-01" } });
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("A data não pode ser no futuro");
    expect(screen.queryByText("O que você quer cuidar primeiro?")).toBeNull();
  });
});
