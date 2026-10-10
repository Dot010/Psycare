import { describe, expect, it } from "vitest";
import type { DiaryEntry } from "@/features/diary/types";
import { toISODate } from "@/lib/dates";
import {
  DAILY_PROMPTS,
  dailyPrompt,
  dayHeading,
  drawingEntry,
  MAX_DRAWING_LENGTH,
  filterEntries,
  getAnxietyTrend,
  groupByDay,
  SUGGESTIONS,
  titleFromContent,
  weekDays,
  writtenDays,
} from "./utils";

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

describe("convite do dia, dias escritos e título", () => {
  it("o convite é fixo no dia e muda no dia seguinte", () => {
    expect(dailyPrompt("2026-10-02")).toBe(dailyPrompt("2026-10-02"));
    expect(DAILY_PROMPTS).toContain(dailyPrompt("2026-10-02"));
    expect(dailyPrompt("2026-10-02")).not.toBe(dailyPrompt("2026-10-03"));
    expect(DAILY_PROMPTS).toContain(dailyPrompt("2025-01-01"));
  });

  it("conta os dias com registro na última semana", () => {
    const entry = (date: string) => ({ id: date, date, mood: "Bem", title: "t", content: "c" });
    const entries = [entry("2026-10-02"), entry("2026-10-02"), entry("2026-10-01"), entry("2026-09-20")];
    expect(writtenDays(entries, "2026-10-02", 7)).toBe(2);
    expect(writtenDays([], "2026-10-02", 7)).toBe(0);
  });

  it("cria um título a partir do começo do texto", () => {
    expect(titleFromContent("Hoje foi um dia calmo")).toBe("Hoje foi um dia calmo");
    expect(titleFromContent("  Primeira linha\nsegunda linha  ")).toBe("Primeira linha");
    const long = "Hoje acordei cedo e fui caminhar no parque perto de casa com calma";
    const title = titleFromContent(long);
    expect(title.endsWith("…")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(41);
  });
});

describe("semana do diário", () => {
  const entry = (date: string, moodLevel?: 1 | 2 | 3 | 4 | 5) => ({
    id: date + String(moodLevel),
    date,
    mood: "x",
    moodLevel,
    title: "t",
    content: "c",
  });

  it("traz os últimos 7 dias, do mais antigo ao de hoje, com contagem e humor médio", () => {
    const week = weekDays(
      [entry("2026-10-09", 4), entry("2026-10-09", 5), entry("2026-10-07", 2), entry("2026-10-01", 3)],
      "2026-10-09",
    );
    expect(week).toHaveLength(7);
    expect(week[0].date).toBe("2026-10-03");
    expect(week[6]).toMatchObject({ date: "2026-10-09", count: 2, level: 5 });
    expect(week[4]).toMatchObject({ date: "2026-10-07", count: 1, level: 2 });
    expect(week[5]).toMatchObject({ count: 0, level: undefined });
  });

  it("tem sugestões para escrever", () => {
    expect(SUGGESTIONS.length).toBeGreaterThanOrEqual(4);
  });
});

describe("drawingEntry", () => {
  const ok = "data:image/png;base64,AAAA";
  it("cria uma página de desenho, com título padrão", () => {
    expect(drawingEntry({ id: "d", dataUrl: ok, title: "  ", today: "2026-10-09" })).toMatchObject({
      id: "d",
      kind: "drawing",
      drawing: ok,
      title: "Meu desenho",
      date: "2026-10-09",
    });
  });
  it("recusa imagem inválida ou grande demais", () => {
    expect(drawingEntry({ id: "d", dataUrl: "http://x/y.png", title: "", today: "2026-10-09" })).toBeNull();
    const big = "data:image/png;base64," + "A".repeat(MAX_DRAWING_LENGTH);
    expect(drawingEntry({ id: "d", dataUrl: big, title: "", today: "2026-10-09" })).toBeNull();
  });
});
