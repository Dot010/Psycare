import { describe, expect, it } from "vitest";
import type { DiaryEntry } from "@/features/diary/types";
import type { CheckIn } from "@/features/garden/types";
import {
  averageOf,
  checkInLevel,
  dailyLevels,
  entryLevel,
  impactSentence,
  lastLevels,
  levelFromLabel,
  monthGrid,
  normalizeTag,
  strongestTagImpact,
  tagFrequency,
  toggleTag,
  weekSentence,
} from "@/features/mood/logic";

const entry = (date: string, mood: string, moodLevel?: 1 | 2 | 3 | 4 | 5): DiaryEntry => ({
  id: date + mood,
  date,
  mood,
  moodLevel,
  title: "t",
  content: "c",
});

describe("rótulos e conversão dos humores antigos", () => {
  it("entende os rostos e as palavras antigas", () => {
    expect(levelFromLabel("Muito bem")).toBe(5);
    expect(levelFromLabel("Mais ou menos")).toBe(3);
    expect(levelFromLabel("Sobrecarregado")).toBe(1);
    expect(levelFromLabel("Ansioso")).toBe(2);
    expect(levelFromLabel("Reflexivo")).toBe(3);
    expect(levelFromLabel("Calmo")).toBe(4);
    expect(levelFromLabel("Motivado")).toBe(5);
    expect(levelFromLabel("outra coisa")).toBeUndefined();
  });

  it("prefere o nível salvo ao rótulo", () => {
    expect(checkInLevel({ date: "2026-10-01", mood: "Calmo", level: 2 })).toBe(2);
    expect(checkInLevel({ date: "2026-10-01", mood: "Calmo" })).toBe(4);
    expect(entryLevel(entry("2026-10-01", "Calmo", 5))).toBe(5);
    expect(entryLevel(entry("2026-10-01", "Calmo"))).toBe(4);
  });
});

describe("tags", () => {
  it("limpa o texto digitado", () => {
    expect(normalizeTag("  prova   da   faculdade  ")).toBe("Prova da faculdade");
    expect(normalizeTag("a")).toBeNull();
    expect(normalizeTag("   ")).toBeNull();
    expect(normalizeTag("x".repeat(60))?.length).toBe(24);
  });

  it("liga, desliga e respeita o limite", () => {
    expect(toggleTag([], "Sono")).toEqual(["Sono"]);
    expect(toggleTag(["Sono"], "Sono")).toEqual([]);
    const cheio = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"];
    expect(toggleTag(cheio, "novo")).toEqual(cheio);
  });
});

describe("humor de cada dia", () => {
  it("o check-in vale mais que o diário; sem check-in usa a média do diário", () => {
    const checkIns: CheckIn[] = [{ date: "2026-10-02", mood: "Bem", level: 4 }];
    const entries = [
      entry("2026-10-02", "Ansioso"),
      entry("2026-10-01", "Calmo"),
      entry("2026-10-01", "Motivado"),
    ];
    const levels = dailyLevels(checkIns, entries);
    expect(levels.get("2026-10-02")).toBe(4);
    expect(levels.get("2026-10-01")).toBe(4.5);
  });

  it("monta a semana e a média ignorando dias sem registro", () => {
    const levels = new Map([
      ["2026-10-01", 2],
      ["2026-10-03", 4],
    ]);
    const week = lastLevels(levels, "2026-10-03", 3);
    expect(week.map((d) => d.date)).toEqual(["2026-10-01", "2026-10-02", "2026-10-03"]);
    expect(week.map((d) => d.level)).toEqual([2, null, 4]);
    expect(averageOf(week)).toBe(3);
    expect(averageOf([{ date: "x", level: null }])).toBeNull();
  });

  it("escolhe a frase da semana", () => {
    expect(weekSentence(null, null)).toMatch(/Registre/);
    expect(weekSentence(3.6, 3)).toMatch(/mais leve que a anterior/);
    expect(weekSentence(2.5, 3.5)).toMatch(/mais pesada/);
    expect(weekSentence(3.2, 3.1)).toMatch(/parecida/);
    expect(weekSentence(4, null)).toBe("Uma semana mais leve.");
    expect(weekSentence(1.5, null)).toMatch(/pesada/);
  });
});

describe("canteiro do mês", () => {
  it("alinha o primeiro dia no dia da semana certo e marca hoje e o futuro", () => {
    // 1 de outubro de 2026 é quinta-feira
    const levels = new Map([["2026-10-02", 5]]);
    const grid = monthGrid(levels, "2026-10-03");
    expect(grid.slice(0, 4)).toEqual([null, null, null, null]);
    const first = grid[4];
    expect(first).toMatchObject({ date: "2026-10-01", day: 1, level: null });
    expect(grid[5]).toMatchObject({ date: "2026-10-02", level: 5, isToday: false, isFuture: false });
    expect(grid[6]).toMatchObject({ date: "2026-10-03", isToday: true });
    expect(grid[7]).toMatchObject({ date: "2026-10-04", isFuture: true });
    expect(grid.filter(Boolean)).toHaveLength(31);
  });
});

describe("tags no tempo", () => {
  const checkIns: CheckIn[] = [
    { date: "2026-10-01", mood: "Mal", level: 2, tags: ["Sono", "Trabalho"] },
    { date: "2026-10-02", mood: "Mal", level: 2, tags: ["Sono"] },
    { date: "2026-10-03", mood: "Bem", level: 4, tags: ["Família"] },
    { date: "2026-09-01", mood: "Bem", level: 4, tags: ["Sono"] },
  ];

  it("conta as tags nos últimos dias, da mais frequente para a menos", () => {
    expect(tagFrequency(checkIns, "2026-10-03", 30)).toEqual([
      { tag: "Sono", days: 2 },
      { tag: "Família", days: 1 },
      { tag: "Trabalho", days: 1 },
    ]);
  });

  it("só aponta uma tag com dias suficientes dos dois lados", () => {
    const many: CheckIn[] = [
      ...[1, 2, 3].map((d) => ({ date: `2026-10-0${d}`, mood: "Mal", level: 2 as const, tags: ["Sono"] })),
      ...[4, 5, 6].map((d) => ({ date: `2026-10-0${d}`, mood: "Bem", level: 4 as const, tags: ["Família"] })),
    ];
    const levels = dailyLevels(many, []);
    const impact = strongestTagImpact(many, levels);
    expect(impact?.tag).toBe("Sono");
    expect(impact?.difference).toBe(-2);
    expect(impactSentence(impact!)).toBe(
      "Nos dias em que você marcou Sono, seu humor ficou em média 2,0 pontos mais baixo.",
    );
    expect(strongestTagImpact(checkIns, dailyLevels(checkIns, []))).toBeNull();
  });
});
