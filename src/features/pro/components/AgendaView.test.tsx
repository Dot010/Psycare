import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { APPOINTMENTS_KEY } from "@/features/appointments/hooks/useAppointments";
import { ADDED_SESSIONS_KEY, CLOSINGS_KEY, NOTES_KEY } from "../hooks/usePro";
import { PROFESSIONALS } from "../identity";
import AgendaView from "./AgendaView";
import { ProIdentityProvider } from "./ProIdentity";

beforeEach(() => localStorage.clear());

const setup = (pro = PROFESSIONALS[0]) =>
  render(
    <ProIdentityProvider value={pro}>
      <UndoProvider>
        <AgendaView />
      </UndoProvider>
    </ProIdentityProvider>,
  );
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "[]");

describe("Agenda do profissional", () => {
  it("encerrar pela agenda pede a evolução e lança a cobrança, como no painel", async () => {
    setup();
    const today = screen.getByRole("region", { name: "Hoje" });
    expect(within(today).queryByRole("button", { name: "Marcar como realizada" })).not.toBeInTheDocument();
    await userEvent.click(within(today).getAllByRole("button", { name: "Encerrar sessão" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Sessão realizada" }));
    await userEvent.type(screen.getByLabelText("2. Evolução da sessão"), "Falou do trabalho.");
    await userEvent.click(screen.getByRole("button", { name: "Encerrar e salvar" }));
    expect(stored(NOTES_KEY)[0]).toMatchObject({ text: "Falou do trabalho.", proId: "pro_psi_01" });
    expect(stored(CLOSINGS_KEY)[0]).toMatchObject({ outcome: "realizada", proId: "pro_psi_01" });
  });

  it("cada profissional tem a sua agenda: os horários do psiquiatra são outros", () => {
    const first = setup();
    expect(within(screen.getByRole("region", { name: "Hoje" })).getByText("09:00")).toBeInTheDocument();
    first.unmount();
    setup(PROFESSIONALS[1]);
    const today = screen.getByRole("region", { name: "Hoje" });
    expect(within(today).queryByText("09:00")).not.toBeInTheDocument();
    expect(within(today).getByText("11:00")).toBeInTheDocument();
  });

  it("marca uma sessão nova; a do paciente de demonstração aparece para ele em Consultas", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Nova sessão" }));
    await userEvent.selectOptions(screen.getByLabelText("Paciente"), "pac_pedro");
    await userEvent.click(screen.getByRole("button", { name: "Marcar" }));
    expect(stored(ADDED_SESSIONS_KEY)[0]).toMatchObject({ patientId: "pac_pedro", proId: "pro_psi_01" });

    await userEvent.click(screen.getByRole("button", { name: "Nova sessão" }));
    await userEvent.selectOptions(screen.getByLabelText("Paciente"), "usr_01");
    await userEvent.clear(screen.getByLabelText("Hora"));
    await userEvent.type(screen.getByLabelText("Hora"), "18:15");
    await userEvent.click(screen.getByRole("button", { name: "Marcar" }));
    const mine = stored(APPOINTMENTS_KEY).filter((a: { hora: string }) => a.hora === "18:15");
    expect(mine[0]).toMatchObject({ profissional: "Dra. Helena Prado", status: "confirmado" });
  });
});
