import { describe, expect, it } from "vitest";
import type { DiaryEntry } from "@/features/diary/types";
import { toISODate } from "@/lib/dates";
import { dayHeading, filterEntries, getAnxietyTrend, groupByDay } from "./utils";

const entry = (over: Partial<DiaryEntry>): DiaryEntry => ({
  id: "x",
  date: "2026-09-03",
  mood: "Calmo",
  title: "Título",
  content: "Conteúdo do dia",
  ...over,
});

describe("diary utils", () => {
  it("toISODate usa a data local", () => {
    expect(toISODate(new Date(2026, 8, 3))).toBe("2026-09-03");
  });

  it("dayHeading mostra Hoje, Ontem ou a data por extenso", () => {
    expect(dayHeading("2026-09-03", "2026-09-03")).toBe("Hoje");
    expect(dayHeading("2026-09-02", "2026-09-03")).toBe("Ontem");
    expect(dayHeading("2026-08-30", "2026-09-03")).toContain("agosto");
  });

  it("groupByDay ordena do mais recente ao mais antigo e junta o mesmo dia", () => {
    const groups = groupByDay([
      entry({ id: "1", date: "2026-09-01" }),
      entry({ id: "2", date: "2026-09-03" }),
      entry({ id: "3", date: "2026-09-03" }),
    ]);
    expect(groups.map((g) => g.date)).toEqual(["2026-09-03", "2026-09-01"]);
    expect(groups[0].entries.map((e) => e.id)).toEqual(["2", "3"]);
  });

  it("filterEntries combina busca, humor e 'para a consulta'", () => {
    const list = [
      entry({ id: "1", title: "Prova", mood: "Ansioso", discussInSession: true }),
      entry({ id: "2", title: "Caminhada", mood: "Calmo" }),
    ];
    expect(filterEntries(list, { query: "prova", mood: "", onlyForSession: false })).toHaveLength(1);
    expect(filterEntries(list, { query: "", mood: "Calmo", onlyForSession: false })[0].id).toBe("2");
    expect(filterEntries(list, { query: "", mood: "", onlyForSession: true })[0].id).toBe("1");
  });

  it("getAnxietyTrend calcula a média por dia e deixa null onde não há registro", () => {
    const trend = getAnxietyTrend(
      [
        entry({ id: "1", date: "2026-09-03", anxietyLevel: 2 }),
        entry({ id: "2", date: "2026-09-03", anxietyLevel: 4 }),
        entry({ id: "3", date: "2026-09-01" }),
      ],
      "2026-09-03",
      3,
    );
    expect(trend.map((p) => p.date)).toEqual(["2026-09-01", "2026-09-02", "2026-09-03"]);
    expect(trend.map((p) => p.average)).toEqual([null, null, 3]);
  });
});
