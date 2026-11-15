import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { toISODate } from "@/lib/dates";
import { CLOSINGS_KEY, FEES_KEY } from "../hooks/usePro";
import { PROFESSIONALS } from "../identity";
import FinanceView from "./FinanceView";
import { ProIdentityProvider } from "./ProIdentity";

const today = toISODate(new Date());

function setup() {
  return render(
    <ProIdentityProvider value={PROFESSIONALS[0]}>
      <UndoProvider>
        <FinanceView />
      </UndoProvider>
    </ProIdentityProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    CLOSINGS_KEY,
    JSON.stringify([
      {
        sessionId: "s1",
        patientId: "pac_marina",
        date: today,
        outcome: "realizada",
        charge: 180,
        paid: false,
      },
    ]),
  );
});

describe("Financeiro", () => {
  it("mostra o mês em números e os gráficos com nome para leitor de tela", () => {
    setup();
    expect(screen.getByText("A receber").nextElementSibling).toHaveTextContent(/R\$\s?180,00/);
    expect(screen.getByRole("img", { name: /^Valores por semana\./ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Recebido por mês\./ })).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Quem está devendo" })).getByText("Marina Costa"),
    ).toBeInTheDocument();
  });

  it("marcar como pago tira da lista de quem deve e libera o recibo", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: "Pendentes" }));
    await userEvent.click(screen.getByRole("button", { name: "Marcar como pago" }));

    expect(JSON.parse(localStorage.getItem(CLOSINGS_KEY) ?? "[]")[0].paid).toBe(true);
    expect(screen.getByText("Nenhuma cobrança pendente.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: "Todas" }));
    await userEvent.click(screen.getAllByRole("button", { name: "Recibo" })[0]);
    expect(screen.getByRole("dialog")).toHaveTextContent(/Recebi de Marina Costa, CPF \[CPF DO PACIENTE\]/);
  });

  it("o valor da sessão muda só para as próximas cobranças", async () => {
    setup();
    const field = screen.getByLabelText("Marina Costa");
    await userEvent.clear(field);
    await userEvent.type(field, "200");
    await userEvent.click(within(field.closest("form")!).getByRole("button", { name: "Salvar" }));

    expect(JSON.parse(localStorage.getItem(FEES_KEY) ?? "{}").pac_marina).toBe(200);
    expect(JSON.parse(localStorage.getItem(CLOSINGS_KEY) ?? "[]")[0].charge).toBe(180);
  });

  it("não aceita valor absurdo", async () => {
    setup();
    const field = screen.getByLabelText("Pedro Alves");
    await userEvent.clear(field);
    await userEvent.type(field, "99999");
    expect(within(field.closest("form")!).getByRole("button", { name: "Salvar" })).toBeDisabled();
  });
});
