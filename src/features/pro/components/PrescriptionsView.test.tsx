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
    const patients = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(patients).toContain("Pedidos dos pacientes");
    expect(patients).toContain("Usuário Demonstração");
    expect(patients).toContain("Pedro Alves");
    // Marina tem receita com folga e Lúcia está suspensa: não aparecem no filtro padrão.
    expect(patients).not.toContain("Marina Costa");
    expect(patients).not.toContain("Lúcia Fernandes");
  });

  it("'Todas' mostra também as receitas em dia", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Todas" }));
    expect(screen.getByRole("heading", { name: "Marina Costa", level: 2 })).toBeInTheDocument();
  });

  it("cada receita mostra tipo, consulta e período de uso", () => {
    setup();
    const section = screen.getByRole("region", { name: "Usuário Demonstração" });
    expect(within(section).getByText(/Notificação A · amarela/)).toBeInTheDocument();
    expect(within(section).getAllByText(/Consulta de/).length).toBeGreaterThan(0);
    expect(within(section).getAllByText(/Use de/).length).toBeGreaterThan(0);
  });

  it("Nova receita abre já preenchida e emite sem mudança em 2 toques", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Nova receita de Sertralina para Usuário Demonstração" }),
    );
    expect(screen.getByLabelText("Remédio")).toHaveValue("Sertralina");
    expect(screen.getByRole("button", { name: "Sem mudança" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Emitir receita" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Emitida, ela já não precisa de atenção; em "Todas" aparece a nova e a antiga.
    await userEvent.click(screen.getByRole("button", { name: "Todas" }));
    const section = screen.getByRole("region", { name: "Usuário Demonstração" });
    expect(within(section).getAllByRole("heading", { name: "Sertralina" })).toHaveLength(2);
    expect(screen.queryByText("Receita emitida (simulado).")).toBeInTheDocument();
  });

  it("mudar a dose marca 'Dose mudou' sozinho", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Nova receita de Sertralina para Usuário Demonstração" }),
    );
    const dose = screen.getByLabelText("Dose e como usar");
    await userEvent.clear(dose);
    await userEvent.type(dose, "100 mg, 1 comprimido pela manhã");
    expect(screen.getByRole("button", { name: "Dose mudou" })).toHaveAttribute("aria-pressed", "true");
  });

  it("atender um pedido o tira da caixa de pedidos", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Atender pedido de Pedro Alves/ }));
    await userEvent.click(screen.getByRole("button", { name: "Emitir receita" }));
    expect(screen.queryByRole("button", { name: /Atender pedido de Pedro Alves/ })).not.toBeInTheDocument();
  });

  it("suspender não emite receita nova e marca a última como suspensa", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Nova receita de Sertralina para Usuário Demonstração" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Suspendeu" }));
    expect(screen.queryByRole("button", { name: "Emitir receita" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Registrar suspensão" }));
    await userEvent.click(screen.getByRole("button", { name: "Todas" }));
    const section = screen.getByRole("region", { name: "Usuário Demonstração" });
    expect(within(section).getAllByText("Suspensa").length).toBe(1);
    expect(within(section).getAllByRole("heading", { name: "Sertralina" })).toHaveLength(1);
  });
});
