import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import HealthView from "./HealthView";

function Both() {
  const rx = usePrescriptions();
  const last = rx.prescriptions.find((p) => p.patientId === LIVE_PATIENT_ID && p.nome === "Lyberdia");
  return (
    <>
      <button
        onClick={() =>
          rx.register({
            draft: {
              patientId: LIVE_PATIENT_ID,
              nome: "Sertralina",
              dosagem: "50 mg, 1 comprimido pela manhã",
              kind: "common",
              useFrom: rx.today,
              useUntil: "2099-01-01",
            },
            origin: { type: "consultation", consultationId: "c_u3" },
          })
        }
      >
        Psiquiatra registra Sertralina
      </button>
      <button onClick={() => last && rx.stop(last, "Troca de medicação")}>
        Psiquiatra suspende Lyberdia
      </button>
      <HealthView />
    </>
  );
}
const setup = () =>
  render(
    <UndoProvider>
      <Both />
    </UndoProvider>,
  );
const list = () => screen.getByRole("region", { name: "Meus remédios" });

describe("Saúde: a lista de remédios vem do psiquiatra", () => {
  beforeEach(() => window.localStorage.clear());

  it("mostra os remédios de exemplo e nenhum botão de cadastro", () => {
    setup();
    expect(within(list()).getByRole("button", { name: "Ver ficha de Lyberdia" })).toBeInTheDocument();
    expect(within(list()).getByRole("button", { name: "Ver ficha de Topiramato" })).toBeInTheDocument();
    expect(within(list()).queryByRole("button", { name: "Adicionar" })).not.toBeInTheDocument();
  });

  it("remédio novo registrado pelo psiquiatra entra sozinho, com horário", async () => {
    setup();
    expect(within(list()).queryByRole("button", { name: "Ver ficha de Sertralina" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Psiquiatra registra Sertralina" }));
    expect(within(list()).getByRole("button", { name: "Ver ficha de Sertralina" })).toBeInTheDocument();
    const row = within(list())
      .getByRole("button", { name: "Ver ficha de Sertralina" })
      .closest("li") as HTMLElement;
    expect(within(row).getByText(/08:00/)).toBeInTheDocument();
  });

  it("remédio suspenso pelo psiquiatra sai da lista", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Psiquiatra suspende Lyberdia" }));
    expect(within(list()).queryByRole("button", { name: "Ver ficha de Lyberdia" })).not.toBeInTheDocument();
  });
});
