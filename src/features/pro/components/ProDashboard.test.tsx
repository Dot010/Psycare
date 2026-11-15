import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { ASSIGNMENTS_KEY } from "@/features/activities/hooks/useActivities";
import { CLOSINGS_KEY, NOTES_KEY, PRO_ASSIGNED_KEY } from "../hooks/usePro";
import { PROFESSIONALS } from "../identity";
import ProDashboard from "./ProDashboard";
import { ProIdentityProvider } from "./ProIdentity";

beforeEach(() => localStorage.clear());

function setup(pro = PROFESSIONALS[0]) {
  return render(
    <ProIdentityProvider value={pro}>
      <UndoProvider>
        <ProDashboard specialty={pro.specialty} />
      </UndoProvider>
    </ProIdentityProvider>,
  );
}

const sessions = () => screen.getByRole("region", { name: "Sessões de hoje" });
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "[]");

describe("Painel do dia: encerrar sessão", () => {
  it("cumprimenta pelo primeiro nome e mostra as sessões de hoje", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/, Helena$/);
    expect(within(sessions()).getByText("Marina Costa")).toBeInTheDocument();
    expect(within(sessions()).getAllByRole("button", { name: "Encerrar sessão" })).toHaveLength(2);
  });

  it("não encerra sem dizer como foi, nem sem a evolução", async () => {
    setup();
    await userEvent.click(within(sessions()).getAllByRole("button", { name: "Encerrar sessão" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Encerrar e salvar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/aconteceu/);

    await userEvent.click(screen.getByRole("button", { name: "Sessão realizada" }));
    await userEvent.click(screen.getByRole("button", { name: "Encerrar e salvar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/evolução/);
    expect(stored(CLOSINGS_KEY)).toEqual([]);
  });

  it("sessão realizada: evolução no prontuário, cobrança no mês e tarefa em Atividades", async () => {
    setup();
    const monthBefore = screen.getByRole("region", { name: "Este mês" }).textContent;
    await userEvent.click(within(sessions()).getAllByRole("button", { name: "Encerrar sessão" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Sessão realizada" }));
    await userEvent.type(
      screen.getByLabelText("2. Evolução da sessão"),
      "Chegou cansada. Trabalhamos o sono.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Já foi pago" }));
    await userEvent.selectOptions(screen.getByLabelText("Atividade"), "sleep");
    await userEvent.click(screen.getByRole("button", { name: "Encerrar e salvar" }));

    expect(screen.getByText(/Sessão de Marina encerrada/)).toHaveTextContent(/tarefa já está em Atividades/);
    expect(within(sessions()).getByText(/Evolução salva · R\$\s?180,00 pago/)).toBeInTheDocument();
    expect(within(sessions()).getAllByRole("button", { name: "Encerrar sessão" })).toHaveLength(1);

    const [note] = stored(NOTES_KEY);
    expect(note).toMatchObject({
      patientId: "pac_marina",
      sessionId: "s1",
      text: "Chegou cansada. Trabalhamos o sono.",
    });
    expect(stored(CLOSINGS_KEY)[0]).toMatchObject({
      sessionId: "s1",
      outcome: "realizada",
      charge: 180,
      paid: true,
    });
    expect(stored(PRO_ASSIGNED_KEY)[0]).toMatchObject({ patientId: "pac_marina", kind: "sleep" });
    expect(screen.getByRole("region", { name: "Este mês" }).textContent).not.toBe(monthBefore);
  });

  it("falta: registra sem texto e só cobra se marcar", async () => {
    setup();
    await userEvent.click(within(sessions()).getAllByRole("button", { name: "Encerrar sessão" })[1]);
    await userEvent.click(screen.getByRole("button", { name: "O paciente faltou" }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Cobrar a falta/ }));
    await userEvent.click(screen.getByRole("button", { name: "Encerrar e salvar" }));

    expect(within(sessions()).getByText("Faltou")).toBeInTheDocument();
    expect(stored(NOTES_KEY)[0].text).toBe("O paciente não compareceu à sessão das 14:00.");
    expect(stored(CLOSINGS_KEY)[0]).toMatchObject({ outcome: "faltou", charge: 220, paid: false });
    // A tarefa para casa só existe quando a sessão aconteceu.
    expect(stored(ASSIGNMENTS_KEY)).toEqual([]);
  });
});

describe("Painel do psiquiatra: encerrar consulta", () => {
  it("tem o passo da conduta, que vai para o prontuário e oferece registrar a receita", async () => {
    setup(PROFESSIONALS[1]);
    const consultas = screen.getByRole("region", { name: "Consultas de hoje" });
    await userEvent.click(within(consultas).getAllByRole("button", { name: "Encerrar consulta" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Consulta realizada" }));
    await userEvent.type(screen.getByLabelText("2. Evolução da consulta"), "Dormindo melhor, sem efeitos.");
    expect(screen.getByRole("button", { name: "Manter a medicação" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await userEvent.click(screen.getByRole("button", { name: "Ajustar a dose" }));
    await userEvent.type(screen.getByLabelText("O que muda"), "Sobe para 20 mg.");
    await userEvent.click(screen.getByRole("button", { name: "Encerrar e salvar" }));

    expect(stored(NOTES_KEY)[0].text).toBe(
      "Dormindo melhor, sem efeitos.\nConduta: ajustar a dose. Sobe para 20 mg.",
    );
    expect(stored(CLOSINGS_KEY)[0].conduct).toBe("dose");
    expect(screen.getByRole("link", { name: "Registrar receita" })).toHaveAttribute(
      "href",
      "/dashboard/pro/prescriptions",
    );
  });
});
