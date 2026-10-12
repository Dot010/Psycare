import { render, screen } from "@testing-library/react";
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

describe("Configurações: nome e ano de nascimento", () => {
  beforeEach(() => window.localStorage.clear());

  it("começam vazios e podem continuar vazios", async () => {
    setup();
    expect(screen.getByLabelText("Nome ou apelido")).toHaveValue("");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(saved()).toEqual({ name: "" });
  });

  it("salva e mostra aviso de ano inválido em português", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Nome ou apelido"), "Mari");
    await userEvent.type(screen.getByLabelText("Ano de nascimento"), "1800");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Escolha um ano entre 1900 e/);
    expect(saved()).toBeNull();

    await userEvent.clear(screen.getByLabelText("Ano de nascimento"));
    await userEvent.type(screen.getByLabelText("Ano de nascimento"), "1991");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(saved()).toEqual({ name: "Mari", birthYear: 1991 });
  });
});
