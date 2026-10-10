import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import PlannerView from "@/features/planner/components/PlannerView";
import ReferralsView from "@/features/pro/components/ReferralsView";
import { ProReferralBox } from "./ProReferralBox";
import { ReferralSection } from "./ReferralSection";

const wrap = (ui: React.ReactElement) => <UndoProvider>{ui}</UndoProvider>;
const step = (name: string) => screen.getByText(name).closest("li") as HTMLElement;

describe("Encaminhamento: paciente", () => {
  beforeEach(() => window.localStorage.clear());

  it("começa sem encaminhamento e deixa pedir", async () => {
    render(wrap(<ReferralSection />));
    expect(screen.queryByRole("list", { name: "Etapas do encaminhamento" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pedir encaminhamento" }));
    expect(screen.getByText("Pedido enviado. Aguardando o seu psiquiatra.")).toBeInTheDocument();
    expect(step("Pedido enviado")).toHaveAttribute("aria-current", "step");
  });

  it("dá para cancelar o pedido antes do psiquiatra emitir", async () => {
    render(wrap(<ReferralSection />));
    await userEvent.click(screen.getByRole("button", { name: "Pedir encaminhamento" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    expect(screen.getByRole("button", { name: "Pedir encaminhamento" })).toBeInTheDocument();
  });

  it("ciclo completo: pedido, emitido, autorizado e entregue", async () => {
    render(
      wrap(
        <>
          <ReferralsView />
          <ReferralSection />
        </>,
      ),
    );
    await userEvent.click(screen.getByRole("button", { name: "Pedir encaminhamento" }));

    // O psiquiatra deixa pronto: vê o pedido do usuário e do exemplo (Marina).
    await userEvent.click(screen.getByRole("button", { name: /Deixei pronto: Usuário Demonstração/ }));
    expect(step("Emitido pelo psiquiatra")).toHaveAttribute("aria-current", "step");

    // O paciente registra o convênio. Sem dados, não avança.
    await userEvent.click(screen.getByRole("button", { name: "O convênio autorizou" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Informe o convênio/);
    await userEvent.type(screen.getByLabelText("Nome do convênio"), "Convênio Exemplo");
    await userEvent.type(screen.getByLabelText("Sessões autorizadas"), "12");
    await userEvent.click(screen.getByRole("button", { name: "O convênio autorizou" }));
    expect(screen.getByText(/Autorizado por Convênio Exemplo: 12 sessões/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Já entreguei à psicóloga" }));
    expect(screen.getByText(/sessões autorizadas/)).toBeInTheDocument();
    expect(step("Entregue à psicóloga")).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: "Pedir encaminhamento" })).toBeInTheDocument();
  });

  it("o emitido vira tarefa 'Levar ao convênio' no Meu dia", async () => {
    render(
      wrap(
        <>
          <ReferralsView />
          <ReferralSection />
          <PlannerView />
        </>,
      ),
    );
    expect(screen.queryByText("Levar o encaminhamento ao convênio")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pedir encaminhamento" }));
    await userEvent.click(screen.getByRole("button", { name: /Deixei pronto: Usuário Demonstração/ }));
    const today = screen.getByRole("region", { name: "Tarefas de hoje" });
    expect(within(today).getByText("Levar o encaminhamento ao convênio")).toBeInTheDocument();
  });
});

describe("Encaminhamento: psiquiatra", () => {
  beforeEach(() => window.localStorage.clear());

  it("vê o pedido da Marina e, ao emitir, ele passa para 'Já emitidos'", async () => {
    render(wrap(<ReferralsView />));
    expect(screen.getByText("Marina Costa")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Deixei pronto: Marina Costa/ }));
    expect(screen.getByText("Nenhum pedido esperando.")).toBeInTheDocument();
    const issued = screen.getByRole("heading", { name: "Já emitidos" }).closest("section") as HTMLElement;
    expect(within(issued).getByText("Marina Costa")).toBeInTheDocument();
  });
});

describe("Encaminhamento: psicóloga", () => {
  beforeEach(() => window.localStorage.clear());

  it("vê a etapa do Pedro (autorizado) e manda um lembrete gentil", async () => {
    render(wrap(<ProReferralBox patientId="pac_pedro" firstName="Pedro" />));
    expect(screen.getByText("Autorizado pelo convênio")).toBeInTheDocument();
    expect(screen.getByText(/Convênio Exemplo, 12 sessões/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Lembrete: entregar a mim" }));
    expect(screen.getByText(/Último lembrete em/)).toBeInTheDocument();
  });

  it("paciente sem encaminhamento: sugere, e o paciente vê o recado", async () => {
    render(
      wrap(
        <>
          <ProReferralBox patientId="usr_01" firstName="Usuário" />
          <ReferralSection />
        </>,
      ),
    );
    expect(screen.queryByText(/sugeriu pedir/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sugerir que peça um encaminhamento" }));
    expect(screen.getByText(/Sua psicóloga sugeriu pedir um encaminhamento/)).toBeInTheDocument();
    expect(screen.getByText(/Você sugeriu em/)).toBeInTheDocument();
  });

  it("o lembrete aparece no card do paciente", async () => {
    render(
      wrap(
        <>
          <ReferralSection />
          <ProReferralBox patientId="usr_01" firstName="Usuário" />
        </>,
      ),
    );
    await userEvent.click(screen.getByRole("button", { name: "Pedir encaminhamento" }));
    await userEvent.click(screen.getByRole("button", { name: "Lembrete: levar ao convênio" }));
    expect(screen.getByText(/Recado da sua psicóloga/)).toBeInTheDocument();
  });
});
