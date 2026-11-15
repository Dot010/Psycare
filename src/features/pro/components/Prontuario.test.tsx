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

describe("Prontuário separado por profissional", () => {
  it("o que a psicóloga escreve não aparece para o psiquiatra, e cada um guarda o seu", async () => {
    const first = setup();
    await userEvent.type(screen.getByLabelText("Registrar evolução"), "Sessão sobre o trabalho.");
    await userEvent.click(screen.getByRole("button", { name: "Guardar no prontuário" }));
    expect(screen.getByText("Sessão sobre o trabalho.")).toBeInTheDocument();
    first.unmount();

    setup(psiquiatra);
    expect(screen.queryByText("Sessão sobre o trabalho.")).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Registrar evolução"), "Consulta de retorno.");
    await userEvent.click(screen.getByRole("button", { name: "Guardar no prontuário" }));
    expect(stored(NOTES_KEY).map((n: { proId: string }) => n.proId)).toEqual(["pro_med_01", "pro_psi_01"]);
  });

  it("registro antigo, sem dono, continua com a psicóloga", () => {
    localStorage.setItem(
      NOTES_KEY,
      JSON.stringify([{ id: "n1", patientId: "pac_marina", date: "2026-10-01", text: "Nota antiga." }]),
    );
    const first = setup();
    expect(screen.getByText("Nota antiga.")).toBeInTheDocument();
    first.unmount();
    setup(psiquiatra);
    expect(screen.queryByText("Nota antiga.")).not.toBeInTheDocument();
  });

  it("a anamnese do psiquiatra tem o roteiro médico e fica separada", async () => {
    setup(psiquiatra);
    expect(screen.getByText(/20 anos \(CFM 1\.821\/2007\)/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Anamnese" }));
    expect(screen.queryByLabelText("Demanda")).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Queixa principal"), "Não durmo há semanas");
    await userEvent.type(screen.getByLabelText("Exame do estado mental"), "Humor ansioso, sem ideação.");
    await userEvent.click(screen.getByRole("button", { name: "Salvar anamnese" }));
    const all = stored(ANAMNESIS_KEY);
    expect(all["pro_med_01:pac_marina"].fields.queixa).toBe("Não durmo há semanas");
    expect(all.pac_marina).toBeUndefined();
  });

  it("para o psiquiatra, o plano se chama Conduta", async () => {
    setup(psiquiatra);
    expect(screen.queryByRole("tab", { name: "Plano terapêutico" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Conduta" }));
    await userEvent.type(screen.getByLabelText("Nova conduta"), "Manter a dose");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    const group = screen.getByRole("group", { name: "Situação de: Manter a dose" });
    expect(within(group).getByRole("button", { name: "Em vigor" })).toHaveAttribute("aria-pressed", "true");
    expect(stored(GOALS_KEY)[0]).toMatchObject({ proId: "pro_med_01" });
  });
});
