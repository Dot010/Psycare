import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import PrescriptionsView from "./PrescriptionsView";

function setup() {
  return render(
    <UndoProvider>
      <PrescriptionsView />
    </UndoProvider>,
  );
}

describe("PrescriptionsView", () => {
  beforeEach(() => window.localStorage.clear());

  it("agrupa por paciente e mostra só o que precisa de atenção", () => {
    setup();
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toContain("Pedidos dos pacientes");
    expect(headings).toContain("Usuário Demonstração");
    expect(headings).toContain("Pedro Alves");
    expect(headings).not.toContain("Marina Costa");
    expect(headings).not.toContain("Lúcia Fernandes");
  });

  it("'Todas' mostra também as receitas em dia", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Todas" }));
    expect(screen.getByRole("heading", { name: "Marina Costa", level: 2 })).toBeInTheDocument();
  });

  it("cada receita mostra tipo, quando foi registrada e o período de uso", () => {
    setup();
    const section = screen.getByRole("region", { name: "Usuário Demonstração" });
    expect(within(section).getByText(/Controle especial|Notificação A · amarela/)).toBeInTheDocument();
    expect(within(section).getAllByText(/Registrada em/).length).toBeGreaterThan(0);
    expect(within(section).getAllByText(/Use de/).length).toBeGreaterThan(0);
  });

  it("'Deixei pronta' registra a partir do pedido, sem pedir consulta, e tira o pedido da caixa", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Deixei pronta: Pedro Alves/ }));
    expect(screen.getByRole("heading", { name: "Registrar receita" })).toBeInTheDocument();
    expect(screen.queryByText("Consulta em que ela sai")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Registrar receita" }));
    expect(screen.queryByRole("button", { name: /Deixei pronta: Pedro Alves/ })).not.toBeInTheDocument();
    expect(screen.getByText("Receita registrada (simulado).")).toBeInTheDocument();
  });

  it("'Precisa de consulta' responde o pedido sem registrar receita", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Precisa de consulta: Pedro Alves/ }));
    expect(screen.queryByRole("button", { name: /Deixei pronta: Pedro Alves/ })).not.toBeInTheDocument();
    expect(screen.getByText("Resposta enviada ao paciente (simulado).")).toBeInTheDocument();
  });

  it("'Não por agora' oferece motivos curtos e opcionais", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Não por agora: Pedro Alves/ }));
    expect(screen.getByRole("button", { name: "Sem motivo" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ainda tem receita válida" }));
    expect(screen.queryByRole("button", { name: /Deixei pronta: Pedro Alves/ })).not.toBeInTheDocument();
  });

  it("registrar nova receita sem pedido exige uma consulta e já vem preenchida", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar nova receita de Sertralina para Usuário Demonstração" }),
    );
    expect(screen.getByLabelText("Remédio")).toHaveValue("Sertralina");
    expect(screen.getByText("Consulta em que ela sai")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sem mudança" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Registrar receita" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mudar a dose marca 'Dose mudou' sozinho", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar nova receita de Sertralina para Usuário Demonstração" }),
    );
    const dose = screen.getByLabelText("Dose e como usar");
    await userEvent.clear(dose);
    await userEvent.type(dose, "100 mg, 1 comprimido pela manhã");
    expect(screen.getByRole("button", { name: "Dose mudou" })).toHaveAttribute("aria-pressed", "true");
  });

  it("suspender não registra receita nova e marca a última como suspensa", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Registrar nova receita de Sertralina para Usuário Demonstração" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Suspendeu" }));
    expect(screen.queryByRole("button", { name: "Registrar receita" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Registrar suspensão" }));
    await userEvent.click(screen.getByRole("button", { name: "Todas" }));
    const section = screen.getByRole("region", { name: "Usuário Demonstração" });
    expect(within(section).getAllByText("Suspensa")).toHaveLength(1);
    expect(within(section).getAllByRole("heading", { name: "Sertralina" })).toHaveLength(1);
  });
});
