import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import PlannerView from "./PlannerView";

/** O psiquiatra e o paciente no mesmo navegador: o botão simula o psiquiatra deixando a receita pronta. */
function Both() {
  const rx = usePrescriptions();
  const request = rx.allRequests.find((r) => r.patientId === LIVE_PATIENT_ID && r.nome === "Lyberdia");
  return (
    <>
      <button
        onClick={() =>
          request &&
          rx.register({
            draft: {
              patientId: LIVE_PATIENT_ID,
              nome: "Lyberdia",
              dosagem: "70 mg, 1 cápsula pela manhã",
              kind: "A",
              useFrom: rx.today,
              useUntil: "2099-01-01",
            },
            origin: { type: "request", requestId: request.id },
          })
        }
      >
        Psiquiatra deixa pronta
      </button>
      <PlannerView />
    </>
  );
}
const setup = () =>
  render(
    <UndoProvider>
      <Both />
    </UndoProvider>,
  );
const todayRegion = () => screen.getByRole("region", { name: "Tarefas de hoje" });

describe("Meu dia ligado à receita e à consulta", () => {
  beforeEach(() => window.localStorage.clear());

  it("sem receita pronta não há tarefa de receita", () => {
    setup();
    expect(screen.queryByText(/Retirar a receita/)).not.toBeInTheDocument();
  });

  it("receita pronta cria 'Retirar a receita' hoje e 'Comprar o remédio' amanhã", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Psiquiatra deixa pronta" }));
    expect(within(todayRegion()).getByText("Retirar a receita de Lyberdia")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Lista" }));
    expect(
      within(screen.getByRole("region", { name: "Amanhã" })).getByText("Comprar o remédio Lyberdia"),
    ).toBeInTheDocument();
  });

  it("marcar 'Retirar a receita' como feita registra o passo do paciente", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Psiquiatra deixa pronta" }));
    const row = within(todayRegion()).getByText("Retirar a receita de Lyberdia").closest("li") as HTMLElement;
    await userEvent.click(within(row).getByRole("checkbox"));
    expect(within(row).getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("'Comprar o remédio' só se conclui no card do remédio", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Psiquiatra deixa pronta" }));
    await userEvent.click(screen.getByRole("tab", { name: "Lista" }));
    const row = screen.getByText("Comprar o remédio Lyberdia").closest("li") as HTMLElement;
    expect(within(row).getByRole("checkbox")).toBeDisabled();
    expect(within(row).getByRole("link", { name: "Abrir" })).toHaveAttribute("href", "/dashboard/health");
  });

  it("tarefa de receita muda de importância, mas não pode ser excluída", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Psiquiatra deixa pronta" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Opções de tarefa Retirar a receita de Lyberdia" }),
    );
    expect(screen.queryByRole("menuitem", { name: /Excluir/ })).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole("menuitem", { name: /Editar/ }));
    expect(screen.getByLabelText("O que fazer")).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "Baixa" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    const row = within(todayRegion()).getByText("Retirar a receita de Lyberdia").closest("li") as HTMLElement;
    expect(within(row).getByText(/Importância baixa/)).toBeInTheDocument();
  });

  it("a consulta confirmada aparece no Meu dia, com hora", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: "Lista" }));
    const row = screen.getByText("Consulta com Dra. Helena Prado (online)").closest("li") as HTMLElement;
    expect(within(row).getByText(/15:30/)).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "Abrir" })).toHaveAttribute(
      "href",
      "/dashboard/appointments",
    );
  });
});
