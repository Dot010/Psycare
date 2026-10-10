import { describe, expect, it } from "vitest";
import {
  applyOverrides,
  consultaTasks,
  habitTasks,
  parseHabitTask,
  parseRxTask,
  receitaTasks,
} from "./linked";
import type { Prescription } from "@/features/pro/types";

const rx: Prescription = {
  id: "r1",
  patientId: "p",
  nome: "Lyberdia",
  dosagem: "70 mg",
  kind: "A",
  origin: { type: "consultation", consultationId: "c" },
  preparedAt: "2026-10-09",
  useFrom: "2026-10-09",
  useUntil: "2026-11-09",
  status: "ready",
  change: "none",
};

describe("receitaTasks", () => {
  it("receita pronta gera retirar (hoje) e comprar (amanhã)", () => {
    const [retirar, comprar] = receitaTasks([rx], {}, "2026-10-09");
    expect(retirar).toMatchObject({
      title: "Retirar a receita de Lyberdia",
      date: "2026-10-09",
      done: false,
      source: "receita",
    });
    expect(comprar).toMatchObject({
      title: "Comprar o remédio Lyberdia",
      date: "2026-10-10",
      readonly: true,
    });
  });
  it("depois de retirar, a primeira já vem feita", () => {
    const [retirar, comprar] = receitaTasks([rx], { r1: "retirei" }, "2026-10-09");
    expect(retirar.done).toBe(true);
    expect(comprar.done).toBe(false);
  });
  it("sem receita pendente não há tarefa", () => {
    expect(receitaTasks([], {}, "2026-10-09")).toEqual([]);
  });
  it("reconhece o id das tarefas de receita", () => {
    expect(parseRxTask("rx:r1:retirar")).toEqual({ prescriptionId: "r1", kind: "retirar" });
    expect(parseRxTask("t1")).toBeUndefined();
  });
});

describe("consultaTasks", () => {
  const base = { profissional: "Dra. Helena", hora: "15:30", tipo: "online" as const };
  it("só consultas confirmadas de hoje em diante", () => {
    const list = consultaTasks(
      [
        { id: "1", data: "2026-10-15", status: "confirmado", ...base },
        { id: "2", data: "2026-10-20", status: "pendente", ...base },
        { id: "3", data: "2026-09-08", status: "confirmado", ...base },
      ],
      "2026-10-09",
    );
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      title: "Consulta com Dra. Helena (online)",
      date: "2026-10-15",
      time: "15:30",
      source: "consulta",
    });
  });
});

describe("applyOverrides", () => {
  it("muda dia, hora e importância e mantém o resto", () => {
    const [t] = receitaTasks([rx], {}, "2026-10-09");
    const [changed] = applyOverrides([t], {
      [t.id]: { date: "2026-10-12", time: "09:00", importance: "low" },
    });
    expect(changed).toMatchObject({ date: "2026-10-12", time: "09:00", importance: "low", title: t.title });
  });
  it("sem ajuste devolve a tarefa como está", () => {
    const [t] = receitaTasks([rx], {}, "2026-10-09");
    expect(applyOverrides([t], {})[0]).toBe(t);
  });
});

describe("habitTasks", () => {
  it("cada hábito vira uma tarefa de hoje, feita só se foi concluído hoje", () => {
    const tasks = habitTasks(
      [
        { id: "1", title: "Treinar", category: "Saúde", streak: 2, lastCompleted: "2026-10-09" },
        { id: "2", title: "Passear", category: "Saúde", streak: 0 },
      ],
      "2026-10-09",
    );
    expect(tasks.map((t) => [t.id, t.done, t.date, t.source])).toEqual([
      ["habit:1", true, "2026-10-09", "habito"],
      ["habit:2", false, "2026-10-09", "habito"],
    ]);
    expect(parseHabitTask("habit:2")).toBe("2");
    expect(parseHabitTask("rx:1:retirar")).toBeUndefined();
  });
});
