import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import { MedicineFicha } from "./MedicineFicha";
import type { Medicamento } from "../types";

const lyberdia: Medicamento = {
  id: "1",
  nome: "Lyberdia",
  dosagem: "70mg",
  frequencia: "Diária",
  horario: "08:00",
};
const topiramato: Medicamento = {
  id: "2",
  nome: "Topiramato",
  dosagem: "100mg",
  frequencia: "Diária",
  horario: "20:00",
};

function show(item: Medicamento, taken: string[] = []) {
  return render(
    <UndoProvider>
      <MedicineFicha item={item} taken={taken}>
        <p>{item.nome}</p>
      </MedicineFicha>
    </UndoProvider>,
  );
}
const openSheet = (nome: string) =>
  userEvent.click(screen.getByRole("button", { name: `Ver ficha de ${nome}` }));

describe("MedicineFicha (Meus remédios)", () => {
  beforeEach(() => window.localStorage.clear());

  it("mostra a caixa em 3D ao lado do remédio", () => {
    show(lyberdia);
    expect(screen.getByRole("img", { name: /Ilustração da forma do remédio Lyberdia/ })).toBeInTheDocument();
  });

  it("a ficha mostra como o psiquiatra pediu", async () => {
    show(lyberdia);
    await openSheet("Lyberdia");
    const box = screen.getByRole("region", { name: "Receita do seu psiquiatra" });
    expect(within(box).getByText("70 mg, 1 cápsula pela manhã")).toBeInTheDocument();
  });

  it("estoque baixo avisa 'acabando' e mostra o pedido enviado do exemplo", async () => {
    show(lyberdia);
    expect(screen.getByText(/Acabando: dá para uns 9 dias/)).toBeInTheDocument();
    await openSheet("Lyberdia");
    expect(screen.getByText(/Restam cerca de/)).toHaveTextContent("9 cápsulas");
    expect(screen.getByText(/Pedido enviado/)).toBeInTheDocument();
  });

  it("cada dose marcada tira uma cápsula do estoque", async () => {
    show(lyberdia, ["1|2026-10-02|08:00", "1|2026-10-03|08:00"]);
    await openSheet("Lyberdia");
    expect(screen.getByText(/Restam cerca de/)).toHaveTextContent("7 cápsulas");
  });

  it("cancelado o pedido, com estoque baixo dá para pedir de novo", async () => {
    show(lyberdia);
    await openSheet("Lyberdia");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    await userEvent.click(screen.getByRole("button", { name: "Pedir nova receita" }));
    expect(screen.getByText(/Pedido enviado/)).toBeInTheDocument();
  });

  it("com muito estoque não aparece 'acabando' nem o botão de pedir", async () => {
    show(topiramato);
    expect(screen.queryByText(/Acabando/)).not.toBeInTheDocument();
    await openSheet("Topiramato");
    expect(screen.getByText(/Restam cerca de/)).toHaveTextContent("40 comprimidos");
    expect(screen.queryByRole("button", { name: "Pedir nova receita" })).not.toBeInTheDocument();
  });

  it("o paciente não vê receita nenhuma enquanto não houver uma pronta", async () => {
    show(lyberdia);
    await openSheet("Lyberdia");
    expect(screen.queryByText(/Receita pronta para retirar/)).not.toBeInTheDocument();
  });

  it("não deixa adicionar, editar nem apagar o remédio", () => {
    show(lyberdia);
    expect(screen.queryByRole("button", { name: /Adicionar|Editar|Excluir/ })).not.toBeInTheDocument();
  });

  it("remédio sem estoque pergunta quantas tem hoje e passa a contar", async () => {
    show({ ...lyberdia, id: "9", nome: "Remédio Novo" });
    await openSheet("Remédio Novo");
    await userEvent.type(screen.getByLabelText(/Quantas .* você tem hoje/), "20");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(screen.getByText(/Restam cerca de/)).toHaveTextContent("20 comprimidos");
  });

  it("registra um sintoma pela ficha, com a intensidade", async () => {
    show(lyberdia);
    await openSheet("Lyberdia");
    await userEvent.click(screen.getByRole("button", { name: "Registrar sintoma" }));
    await userEvent.click(screen.getByRole("button", { name: "Insônia" }));
    await userEvent.click(screen.getByRole("radio", { name: /4 de 5/ }));
    await userEvent.click(screen.getByRole("button", { name: "Registrar" }));
    const list = screen.getByRole("region", { name: "Sintomas com este remédio" });
    expect(within(list).getByText(/Insônia · Forte/)).toBeInTheDocument();
  });
});

/** Fluxo completo: o psiquiatra deixa pronta, o paciente retira e compra, e a receita some. */
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
      <MedicineFicha item={lyberdia} taken={[]}>
        <p>Lyberdia</p>
      </MedicineFicha>
    </>
  );
}

describe("ciclo da receita no card", () => {
  beforeEach(() => window.localStorage.clear());

  it("pronta → retirei → comprei: a receita some e o estoque soma a caixa", async () => {
    render(
      <UndoProvider>
        <Both />
      </UndoProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Psiquiatra deixa pronta" }));
    expect(screen.getByText("Receita pronta para retirar.")).toBeInTheDocument();
    await openSheet("Lyberdia");
    expect(screen.getByText(/Retire até/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Já retirei a receita" }));
    await userEvent.click(screen.getByRole("button", { name: "Já comprei o remédio" }));
    expect(screen.getByLabelText(/Quantas cápsulas vieram/)).toHaveValue(30);
    await userEvent.click(screen.getByRole("button", { name: "Confirmar compra" }));
    expect(screen.queryByText(/Receita pronta para retirar/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Retire até/)).not.toBeInTheDocument();
    expect(screen.getByText(/Restam cerca de/)).toHaveTextContent("39 cápsulas");
    expect(screen.queryByText(/Acabando/)).not.toBeInTheDocument();
  });
});
