import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UserProvider } from "@/components/providers/UserProvider";
import { PROFILE_KEY } from "@/features/profile/schema";
import SettingsView from "./SettingsView";

const saved = () => JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null");

function setup() {
  return render(
    <UserProvider>
      <SettingsView />
    </UserProvider>,
  );
}

describe("Configurações: nome e data de nascimento", () => {
  beforeEach(() => window.localStorage.clear());

  it("começam vazios e podem continuar vazios", async () => {
    setup();
    expect(screen.getByLabelText("Nome ou apelido")).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(saved()).toEqual({ name: "" });
  });

  it("salva e mostra aviso de data inválida em português", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Nome ou apelido"), "Mari");
    fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: "1800-01-01" } });
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha uma data a partir de 1900");
    expect(saved()).toBeNull();

    fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: "1991-03-08" } });
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(saved()).toEqual({ name: "Mari", birthDate: "1991-03-08" });
  });
});
