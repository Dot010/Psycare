import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { ANAMNESIS_KEY, GOALS_KEY, NOTES_KEY } from "../hooks/usePro";
import { Prontuario } from "./Prontuario";

beforeEach(() => localStorage.clear());

const setup = () =>
  render(
    <UndoProvider>
      <Prontuario patientId="pac_marina" firstName="Marina" />
    </UndoProvider>,
  );
const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? "null");

describe("Prontuário", () => {
  it("avisa a regra: nada se apaga e o paciente pode pedir acesso", () => {
    setup();
    expect(screen.getByText(/Nada aqui se apaga/)).toHaveTextContent(/Marina tem direito de pedir acesso/);
  });

  it("evolução não tem Apagar; corrigir guarda a versão anterior", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Registrar evolução"), "Ligou para remarcar. Estava ansiosa.");
    await userEvent.click(screen.getByRole("button", { name: "Guardar no prontuário" }));

    expect(screen.queryByRole("button", { name: /Apagar|Excluir/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Corrigir" }));
    const box = screen.getByLabelText(/Corrigir a evolução/);
    await userEvent.clear(box);
    await userEvent.type(box, "Ligou para remarcar. Estava ansiosa com o trabalho.");
    await userEvent.click(screen.getByRole("button", { name: "Salvar correção" }));

    expect(screen.getByText("Ligou para remarcar. Estava ansiosa com o trabalho.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ver 1 versão anterior" }));
    expect(
      within(screen.getByRole("list", { name: "Versões anteriores" })).getByText(
        "Ligou para remarcar. Estava ansiosa.",
      ),
    ).toBeInTheDocument();
    expect(stored(NOTES_KEY)[0].versions).toHaveLength(1);
  });

  it("anamnese salva e, ao mudar, guarda como estava", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: "Anamnese" }));
    await userEvent.type(screen.getByLabelText("Demanda"), "Ansiedade no trabalho");
    await userEvent.click(screen.getByRole("button", { name: "Salvar anamnese" }));
    expect(screen.getByText(/Atualizada em/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Demanda"), " e insônia");
    await userEvent.click(screen.getByRole("button", { name: "Salvar anamnese" }));

    const saved = stored(ANAMNESIS_KEY).pac_marina;
    expect(saved.fields.demanda).toBe("Ansiedade no trabalho e insônia");
    expect(saved.history[0].fields.demanda).toBe("Ansiedade no trabalho");
    expect(screen.getByRole("button", { name: "Ver 1 versão anterior" })).toBeInTheDocument();
  });

  it("plano: objetivo novo em andamento e alcançado fica no histórico", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: "Plano terapêutico" }));
    await userEvent.type(screen.getByLabelText("Novo objetivo"), "Dormir 6 horas");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    const group = screen.getByRole("group", { name: "Situação de: Dormir 6 horas" });
    expect(within(group).getByRole("button", { name: "Em andamento" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await userEvent.click(within(group).getByRole("button", { name: "Alcançado" }));

    expect(screen.getByText("1 de 1 objetivo alcançado.")).toBeInTheDocument();
    expect(stored(GOALS_KEY)[0]).toMatchObject({ text: "Dormir 6 horas", status: "alcancado" });
  });
});
