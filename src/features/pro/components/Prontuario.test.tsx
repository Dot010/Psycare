import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { EXAM_CHANGES_KEY } from "../hooks/useExams";
import { ANAMNESIS_KEY, GOALS_KEY, NOTES_KEY } from "../hooks/usePro";
import { PROFESSIONALS } from "../identity";
import { Prontuario } from "./Prontuario";
import { ProIdentityProvider } from "./ProIdentity";

beforeEach(() => localStorage.clear());

const [psicologa, psiquiatra] = PROFESSIONALS;
const setup = (pro = psicologa, patientId = "pac_marina", firstName = "Marina") =>
  render(
    <ProIdentityProvider value={pro}>
      <UndoProvider>
        <Prontuario patientId={patientId} firstName={firstName} />
      </UndoProvider>
    </ProIdentityProvider>,
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

describe("Prontuário do psiquiatra", () => {
  it("a psicóloga não tem as abas de Medicação e Exames", () => {
    setup();
    expect(screen.queryByRole("tab", { name: "Medicação" })).not.toBeInTheDocument();
  });

  it("Medicação mostra o remédio em uso e a receita", async () => {
    setup(psiquiatra);
    await userEvent.click(screen.getByRole("tab", { name: "Medicação" }));

    expect(screen.getByRole("heading", { name: "Escitalopram" })).toBeInTheDocument();
    expect(screen.getByText("Em uso")).toBeInTheDocument();
    expect(screen.getByText(/10 mg, 1 comprimido pela manhã/)).toBeInTheDocument();
  });

  it("Exames: pedir um exame novo para o paciente", async () => {
    setup(psiquiatra, "pac_pedro", "Pedro");
    await userEvent.click(screen.getByRole("tab", { name: "Exames" }));
    expect(screen.getByText("Glicemia", { selector: "p" })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Exame a pedir"), "TSH");
    await userEvent.click(screen.getByRole("button", { name: "Pedir exame" }));

    expect(screen.getByText("TSH", { selector: "p" })).toBeInTheDocument();
    expect(stored(EXAM_CHANGES_KEY).added[0]).toMatchObject({ patientId: "pac_pedro", nome: "TSH", step: 1 });
  });
});
