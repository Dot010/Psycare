import { describe, expect, it } from "vitest";
import {
  buildTask,
  FULL_DAY,
  inbox,
  isFullDay,
  isLocked,
  monthWeeks,
  nextUp,
  overdue,
  postponedDate,
  tasksOn,
  toICS,
  upcoming,
} from "./logic";
import type { Task } from "./types";

const t = (id: string, extra: Partial<Task> = {}): Task => ({
  id,
  title: `Tarefa ${id}`,
  importance: "medium",
  done: false,
  source: "free",
  ...extra,
});

describe("tasksOn", () => {
  it("ordena: com hora por hora, depois sem hora por importância, feitas por último", () => {
    const list = [
      t("a", { date: "2026-10-09", importance: "low" }),
      t("b", { date: "2026-10-09", time: "15:00" }),
      t("c", { date: "2026-10-09", time: "09:00" }),
      t("d", { date: "2026-10-09", importance: "high" }),
      t("e", { date: "2026-10-09", done: true, time: "08:00" }),
      t("x", { date: "2026-10-10" }),
    ];
    expect(tasksOn(list, "2026-10-09").map((x) => x.id)).toEqual(["c", "b", "d", "a", "e"]);
  });
});

describe("listas", () => {
  const list = [
    t("1", { date: "2026-10-07" }),
    t("2", { date: "2026-10-08", done: true }),
    t("3"),
    t("4", { done: true }),
    t("5", { date: "2026-10-11" }),
    t("6", { date: "2026-10-10" }),
    t("7", { date: "2026-10-10", time: "08:00" }),
  ];
  it("'Sem dia' tem só as abertas sem data", () => {
    expect(inbox(list).map((x) => x.id)).toEqual(["3"]);
  });
  it("atrasadas são as abertas de dias que passaram", () => {
    expect(overdue(list, "2026-10-09").map((x) => x.id)).toEqual(["1"]);
  });
  it("próximos dias vêm agrupados e em ordem", () => {
    const groups = upcoming(list, "2026-10-09");
    expect(groups.map(([d]) => d)).toEqual(["2026-10-10", "2026-10-11"]);
    expect(groups[0][1].map((x) => x.id)).toEqual(["7", "6"]);
  });
});

describe("dia cheio", () => {
  it("avisa com o limite de tarefas abertas", () => {
    const full = Array.from({ length: FULL_DAY }, (_, i) => t(String(i), { date: "2026-10-09" }));
    expect(isFullDay(full, "2026-10-09")).toBe(true);
    expect(isFullDay(full.slice(1), "2026-10-09")).toBe(false);
    expect(isFullDay([...full.slice(1), t("z", { date: "2026-10-09", done: true })], "2026-10-09")).toBe(
      false,
    );
  });
});

describe("nextUp (Agora)", () => {
  const list = [
    t("a", { date: "2026-10-09", time: "09:00" }),
    t("b", { date: "2026-10-09", time: "15:00" }),
    t("c", { date: "2026-10-09" }),
  ];
  it("pega a próxima com hora a partir de agora", () => {
    expect(nextUp(list, "2026-10-09", "10:00")?.id).toBe("b");
  });
  it("depois da última hora, cai na primeira sem hora", () => {
    expect(nextUp(list, "2026-10-09", "20:00")?.id).toBe("c");
  });
  it("sem nada aberto devolve nada", () => {
    expect(nextUp([t("a", { date: "2026-10-09", done: true })], "2026-10-09", "08:00")).toBeUndefined();
  });
});

describe("outras regras", () => {
  it("tarefa de profissional é travada; a livre não", () => {
    expect(isLocked(t("a", { source: "receita" }))).toBe(true);
    expect(isLocked(t("a"))).toBe(false);
  });
  it("adiar sem culpa leva para amanhã", () => {
    expect(postponedDate("2026-10-31")).toBe("2026-11-01");
  });
  it("buildTask limpa o título e descarta data e hora inválidas", () => {
    expect(
      buildTask({
        id: "x",
        title: "  Ligar   para a mãe ",
        date: "amanhã",
        time: "25:00",
        importance: "low",
      }),
    ).toEqual({
      id: "x",
      title: "Ligar para a mãe",
      date: undefined,
      time: undefined,
      importance: "low",
      done: false,
      source: "free",
    });
    expect(buildTask({ id: "x", title: "   ", importance: "low" })).toBeNull();
  });
});

describe("monthWeeks", () => {
  it("outubro de 2026 começa numa quinta, acaba num sábado e tem 5 semanas", () => {
    const weeks = monthWeeks(2026, 9);
    expect(weeks).toHaveLength(5);
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null]);
    expect(weeks[0][4]).toBe("2026-10-01");
    expect(weeks[4][6]).toBe("2026-10-31");
    expect(weeks.flat().filter(Boolean)).toHaveLength(31);
  });
});

describe("toICS", () => {
  it("exporta só tarefas abertas com dia, com ou sem hora", () => {
    const ics = toICS(
      [
        t("a", { date: "2026-10-09", time: "08:30", title: "Beber, água" }),
        t("b", { date: "2026-10-10" }),
        t("c"),
        t("d", { date: "2026-10-11", done: true }),
      ],
      "20261009T120000Z",
    );
    expect(ics).toContain("DTSTART:20261009T083000");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261010");
    expect(ics).toContain("SUMMARY:Beber\\, água");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
  });
});
