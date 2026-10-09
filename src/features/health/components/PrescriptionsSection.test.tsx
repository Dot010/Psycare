import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import PrescriptionsView from "@/features/pro/components/PrescriptionsView";
import { PrescriptionsSection } from "./PrescriptionsSection";

const withUndo = (ui: React.ReactElement) => <UndoProvider>{ui}</UndoProvider>;
const card = (name: string) => screen.getByRole("heading", { name, level: 3 }).closest("li") as HTMLElement;

describe("PrescriptionsSection (paciente)", () => {
  beforeEach(() => window.localStorage.clear());

  it("mostra uma receita por remédio, com tipo e prazo", () => {
    render(withUndo(<PrescriptionsSection />));
    const names = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(["Clonazepam", "Metilfenidato", "Sertralina"]);
    expect(within(card("Sertralina")).getByText(/Vence em 2 dias/)).toBeInTheDocument();
    expect(within(card("Metilfenidato")).getByText("Vencida")).toBeInTheDocument();
    expect(within(card("Metilfenidato")).getByText(/Notificação A · amarela/)).toBeInTheDocument();
  });

  it("o pedido de exemplo aparece enviado e pode ser cancelado", async () => {
    render(withUndo(<PrescriptionsSection />));
    const sertralina = card("Sertralina");
    expect(within(sertralina).getByText(/Pedido enviado/)).toBeInTheDocument();
    await userEvent.click(within(sertralina).getByRole("button", { name: "Cancelar pedido" }));
    expect(within(sertralina).getByRole("button", { name: "Pedir nova receita" })).toBeInTheDocument();
  });

  it("pedir nova receita envia o pedido", async () => {
    render(withUndo(<PrescriptionsSection />));
    const clonazepam = card("Clonazepam");
    await userEvent.click(within(clonazepam).getByRole("button", { name: "Pedir nova receita" }));
    expect(within(clonazepam).getByText(/Pedido enviado/)).toBeInTheDocument();
  });

  it("retirei e comprei são passos só do paciente", async () => {
    render(withUndo(<PrescriptionsSection />));
    const clonazepam = card("Clonazepam");
    await userEvent.click(within(clonazepam).getByRole("button", { name: "Já retirei a receita" }));
    await userEvent.click(within(clonazepam).getByRole("button", { name: "Já comprei o remédio" }));
    expect(within(clonazepam).getByText(/Tudo certo/)).toBeInTheDocument();
    expect(within(clonazepam).getByText(/Seu médico não sabe/)).toBeInTheDocument();
  });

  it("a ficha do remédio mostra a ilustração, o preço e o aviso", async () => {
    render(withUndo(<PrescriptionsSection />));
    await userEvent.click(within(card("Sertralina")).getByRole("button", { name: "Ver ficha do remédio" }));
    expect(
      screen.getByRole("img", { name: /Ilustração da forma do remédio Sertralina/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Para que serve")).toBeInTheDocument();
    expect(screen.getByText(/lista CMED/)).toBeInTheDocument();
    expect(
      screen.getByText("Informação geral. Não substitui a orientação do seu médico."),
    ).toBeInTheDocument();
  });

  it("quando o psiquiatra pede consulta, o paciente vê o recado", async () => {
    const view = render(withUndo(<PrescriptionsView />));
    await userEvent.click(screen.getByRole("button", { name: /Precisa de consulta: Usuário Demonstração/ }));
    view.unmount();
    render(withUndo(<PrescriptionsSection />));
    expect(within(card("Sertralina")).getByText(/pede uma consulta antes/)).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Avisos" })).toBeInTheDocument();
  });

  it("quando o psiquiatra deixa pronta, o paciente vê o aviso e o novo prazo", async () => {
    const view = render(withUndo(<PrescriptionsView />));
    await userEvent.click(screen.getByRole("button", { name: /Deixei pronta: Usuário Demonstração/ }));
    await userEvent.click(screen.getByRole("button", { name: "Registrar receita" }));
    view.unmount();
    render(withUndo(<PrescriptionsSection />));
    expect(screen.getByText(/Sua receita de Sertralina está pronta/)).toBeInTheDocument();
    expect(within(card("Sertralina")).getByText("Em dia")).toBeInTheDocument();
  });
});
