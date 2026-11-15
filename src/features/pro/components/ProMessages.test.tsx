import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CHATS_KEY } from "@/features/messages/hooks/useMessages";
import { PROFESSIONALS } from "../identity";
import ProMessages, { PRO_CHATS_KEY } from "./ProMessages";
import { ProIdentityProvider } from "./ProIdentity";

beforeEach(() => localStorage.clear());

const setup = (pro = PROFESSIONALS[0]) =>
  render(
    <ProIdentityProvider value={pro}>
      <ProMessages />
    </ProIdentityProvider>,
  );

describe("Mensagens do profissional", () => {
  it("tem a lista de pacientes e guarda cada conversa separada", async () => {
    setup();
    const list = screen.getByRole("navigation", { name: "Pacientes" });
    expect(within(list).getAllByRole("button")).toHaveLength(4);

    await userEvent.click(within(list).getByRole("button", { name: /Marina Costa/ }));
    expect(screen.getByText("Nenhuma mensagem ainda. Escreva a primeira.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Mensagem"), "Oi, Marina.");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(JSON.parse(localStorage.getItem(PRO_CHATS_KEY)!)["pro_psi_01:pac_marina"][0].content).toBe(
      "Oi, Marina.",
    );
    // A conversa do paciente de demonstração não mudou.
    expect(localStorage.getItem(CHATS_KEY)).toBeNull();
  });
});
