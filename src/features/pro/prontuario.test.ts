import { describe, expect, it } from "vitest";
import { editNote, newGoal, setGoalStatus, stamp, stampLabel, updateAnamnesis } from "./prontuario";
import type { SessionNote } from "./types";

const note: SessionNote = { id: "n1", patientId: "p1", date: "2026-11-10", text: "Primeira versão." };

describe("evolução sem apagar", () => {
  it("editar guarda a versão anterior com data e hora", () => {
    const once = editNote(note, "Segunda versão.", "2026-11-14 10:00");
    const twice = editNote(once, "Terceira versão.", "2026-11-14 11:00");

    expect(twice.text).toBe("Terceira versão.");
    expect(twice.editedAt).toBe("2026-11-14 11:00");
    expect(twice.versions).toEqual([
      { text: "Segunda versão.", until: "2026-11-14 11:00" },
      { text: "Primeira versão.", until: "2026-11-14 10:00" },
    ]);
  });

  it("texto vazio ou igual não cria versão", () => {
    expect(editNote(note, "   ", "2026-11-14 10:00")).toBe(note);
    expect(editNote(note, " Primeira versão. ", "2026-11-14 10:00")).toBe(note);
  });
});

describe("anamnese", () => {
  it("a primeira vez não tem histórico; atualizar guarda como estava", () => {
    const first = updateAnamnesis(
      undefined,
      "p1",
      { demanda: " Ansiedade no trabalho ", apoio: "" },
      "2026-11-01 09:00",
    );
    expect(first).toMatchObject({ fields: { demanda: "Ansiedade no trabalho" }, history: [] });

    const second = updateAnamnesis(first, "p1", { demanda: "Ansiedade e insônia" }, "2026-11-14 09:00");
    expect(second.fields).toEqual({ demanda: "Ansiedade e insônia" });
    expect(second.history).toEqual([
      { fields: { demanda: "Ansiedade no trabalho" }, until: "2026-11-14 09:00" },
    ]);
  });

  it("sem mudança, não cria versão", () => {
    const first = updateAnamnesis(undefined, "p1", { demanda: "Ansiedade" }, "2026-11-01 09:00");
    expect(updateAnamnesis(first, "p1", { demanda: "Ansiedade " }, "2026-11-14 09:00")).toBe(first);
  });
});

describe("plano terapêutico", () => {
  it("objetivo novo começa em andamento; mudar a situação guarda quando", () => {
    expect(newGoal("p1", "  ", "2026-11-14", "g1")).toBeNull();
    const goal = newGoal("p1", "Dormir 6 horas", "2026-11-14", "g1")!;
    expect(goal.status).toBe("andamento");
    expect(setGoalStatus(goal, "alcancado", "2026-11-20")).toMatchObject({
      status: "alcancado",
      updatedAt: "2026-11-20",
    });
    expect(setGoalStatus(goal, "andamento", "2026-11-20")).toBe(goal);
  });
});

describe("datas do prontuário", () => {
  it("formata data e hora local", () => {
    expect(stamp(new Date(2026, 10, 4, 9, 5))).toBe("2026-11-04 09:05");
    expect(stampLabel("2026-11-04 09:05")).toBe("04/11/2026 às 09:05");
    expect(stampLabel("2026-11-04")).toBe("04/11/2026");
  });
});
