import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { UndoProvider } from "@/components/feedback/UndoProvider";
import { DIARY_KEY } from "@/features/diary/hooks/useDiary";
import { toISODate } from "@/lib/dates";
import { QUESTIONS_KEY, SessionPrep, symptomWeek } from "./SessionPrep";

const today = toISODate(new Date());

function setup() {
  return render(
    <UndoProvider>
      <SessionPrep />
    </UndoProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe("sintomas da semana", () => {
  it("conta dias diferentes, do mais frequente ao menos, e ignora o que é antigo", () => {
    const list = [
      { descricao: "Insônia", data: "2026-11-14" },
      { descricao: "Insônia", data: "2026-11-14" },
      { descricao: "Insônia", data: "2026-11-12" },
      { descricao: "Cansaço", data: "2026-11-13" },
      { descricao: "Enjoo", data: "2026-11-01" },
    ];
    expect(symptomWeek(list, "2026-11-14")).toEqual(["Insônia (2 dias)", "Cansaço (1 dia)"]);
  });
});

describe("Preparar a sessão", () => {
  it("mostra só o título das páginas marcadas e deixa tirar uma", async () => {
    localStorage.setItem(
      DIARY_KEY,
      JSON.stringify([
        {
          id: "d1",
          date: today,
          mood: "Mal",
          title: "Briga com a minha mãe",
          content: "texto só meu",
          discussInSession: true,
        },
        { id: "d2", date: today, mood: "Bem", title: "Dia no parque", content: "outro texto" },
      ]),
    );
    setup();
    const diario = screen.getByRole("region", { name: "Do seu diário" });

    expect(within(diario).getByText("Briga com a minha mãe")).toBeInTheDocument();
    expect(within(diario).queryByText("texto só meu")).not.toBeInTheDocument();
    expect(within(diario).queryByText("Dia no parque")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Não levar: Briga com a minha mãe" }));

    expect(within(diario).queryByText("Briga com a minha mãe")).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(DIARY_KEY) ?? "[]");
    expect(saved.find((e: { id: string }) => e.id === "d1").discussInSession).toBe(false);
  });

  it("guarda as perguntas e conta o que vai para a sessão", async () => {
    localStorage.setItem(DIARY_KEY, "[]");
    setup();

    await userEvent.type(screen.getByLabelText("Nova pergunta"), "Posso tomar o remédio de noite?");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByText("Posso tomar o remédio de noite?")).toBeInTheDocument();
    expect(screen.getByText("1 coisa para levar")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(QUESTIONS_KEY) ?? "[]")).toEqual([
      "Posso tomar o remédio de noite?",
    ]);

    await userEvent.click(
      screen.getByRole("button", { name: "Tirar a pergunta: Posso tomar o remédio de noite?" }),
    );
    expect(screen.getByText("0 coisas para levar")).toBeInTheDocument();
  });
});

describe("resumo para mostrar na consulta", () => {
  it("fica aqui, junto do resto da preparação", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Ver resumo para mostrar" }));
    expect(await screen.findByRole("dialog", { name: "Resumo para a consulta" })).toBeInTheDocument();
  });
});
