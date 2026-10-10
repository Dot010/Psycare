import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import PlannerView from "./PlannerView";

const setup = () =>
  render(
    <UndoProvider>
      <PlannerView />
    </UndoProvider>,
  );
const todayRegion = () => screen.getByRole("region", { name: "Tarefas de hoje" });
const item = (title: string) => within(todayRegion()).getByText(title).closest("li") as HTMLElement;

describe("Meu dia", () => {
  beforeEach(() => window.localStorage.clear());

  it("Hoje mostra as tarefas do dia, com hora e importância", () => {
    setup();
    const today = screen.getByRole("region", { name: "Tarefas de hoje" });
    expect(within(today).getByText("Caminhar 15 minutos")).toBeInTheDocument();
    expect(within(today).getByText(/Importância alta/)).toBeInTheDocument();
    expect(within(today).getByText(/17:30/)).toBeInTheDocument();
    expect(within(today).queryByText("Ligar para a minha mãe")).not.toBeInTheDocument();
  });

  it("marcar como feita risca a tarefa e desmarcar volta", async () => {
    setup();
    const box = within(item("Responder o e-mail da faculdade")).getByRole("checkbox");
    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
    await userEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("adiciona uma tarefa com dia, hora e importância", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Nova tarefa" }));
    await userEvent.type(screen.getByLabelText("O que fazer"), "Comprar o remédio");
    await userEvent.type(screen.getByLabelText("Hora (opcional)"), "10:15");
    await userEvent.click(screen.getByRole("radio", { name: "Alta" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar tarefa" }));
    const row = item("Comprar o remédio");
    expect(within(row).getByText(/Importância alta/)).toBeInTheDocument();
    expect(within(row).getByText(/10:15/)).toBeInTheDocument();
  });

  it("não salva tarefa sem título", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Nova tarefa" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar tarefa" }));
    expect(screen.getByText("Escreva o que precisa ser feito")).toBeInTheDocument();
  });

  it("edita o título e a importância de uma tarefa", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Opções de tarefa Responder o e-mail da faculdade" }),
    );
    await userEvent.click(await screen.findByRole("menuitem", { name: /Editar/ }));
    const title = screen.getByLabelText("O que fazer");
    await userEvent.clear(title);
    await userEvent.type(title, "Responder a coordenação");
    await userEvent.click(screen.getByRole("radio", { name: "Baixa" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(within(item("Responder a coordenação")).getByText(/Importância baixa/)).toBeInTheDocument();
  });

  it("exclui e dá para desfazer", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Opções de tarefa Caminhar 15 minutos" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: /Excluir/ }));
    expect(screen.queryByText("Caminhar 15 minutos")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Desfazer/ }));
    expect(screen.getByText("Caminhar 15 minutos")).toBeInTheDocument();
  });

  it("adiar sem culpa leva a tarefa para amanhã", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Adiar sem culpa: Responder o e-mail da faculdade" }),
    );
    expect(
      within(screen.getByRole("region", { name: "Tarefas de hoje" })).queryByText(
        "Responder o e-mail da faculdade",
      ),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Lista" }));
    expect(
      within(screen.getByRole("region", { name: "Amanhã" })).getByText("Responder o e-mail da faculdade"),
    ).toBeInTheDocument();
  });

  it("'Hoje foi difícil' mostra só o essencial e dá para voltar", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Hoje foi difícil" }));
    expect(screen.getByText("Tudo bem. Hoje basta o essencial.")).toBeInTheDocument();
    const today = screen.getByRole("region", { name: "Tarefas de hoje" });
    expect(within(today).getByText("Caminhar 15 minutos")).toBeInTheDocument();
    expect(within(today).queryByText("Responder o e-mail da faculdade")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ver todas as tarefas" }));
    expect(within(todayRegion()).getByText("Responder o e-mail da faculdade")).toBeInTheDocument();
  });

  it("a Lista tem a caixa 'Sem dia' para ideias soltas", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: "Lista" }));
    expect(
      within(screen.getByRole("region", { name: "Sem dia" })).getByText("Organizar a gaveta de remédios"),
    ).toBeInTheDocument();
  });

  it("no Calendário, escolher um dia mostra as tarefas dele e permite adicionar nele", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: "Calendário" }));
    const todayLabel = new Date().toLocaleDateString("pt-BR").slice(0, 5);
    expect(screen.getByRole("button", { name: `${todayLabel}, 3 tarefas abertas` })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Adicionar neste dia" }));
    expect(screen.getByLabelText(/Dia \(abre o calendário\)/)).toHaveValue(
      new Date().toLocaleDateString("sv-SE"),
    );
  });
});
