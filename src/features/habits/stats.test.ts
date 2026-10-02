import { describe, expect, it } from "vitest";
import type { Habit } from "./types";
import { currentStreak, toggleHabitToday } from "./logic";
import { getHabitStats } from "./stats";

const TODAY = "2026-09-10";

const habit = (over: Partial<Habit>): Habit => ({
  id: crypto.randomUUID(),
  title: "x",
  category: "Saúde",
  streak: 0,
  ...over,
});

describe("getHabitStats", () => {
  it("lista vazia não gera NaN", () => {
    expect(getHabitStats([], TODAY)).toEqual({ total: 0, completed: 0, successRate: 0, longestStreak: 0 });
  });

  it("conta concluídos hoje, arredonda a taxa e acha a maior sequência", () => {
    const stats = getHabitStats(
      [
        habit({ lastCompleted: TODAY, streak: 3 }),
        habit({ lastCompleted: "2026-09-09", streak: 9 }),
        habit({ streak: 1 }),
      ],
      TODAY,
    );
    expect(stats).toEqual({ total: 3, completed: 1, successRate: 33, longestStreak: 9 });
  });
});

describe("sequência", () => {
  it("zera quando passou mais de um dia sem concluir", () => {
    expect(currentStreak(habit({ lastCompleted: "2026-09-07", streak: 6 }), TODAY)).toBe(0);
  });

  it("concluir hoje soma 1 se a sequência está viva", () => {
    const next = toggleHabitToday(habit({ lastCompleted: "2026-09-09", streak: 4 }), TODAY);
    expect(next).toMatchObject({ streak: 5, lastCompleted: TODAY });
  });

  it("concluir depois de uma pausa recomeça em 1", () => {
    expect(toggleHabitToday(habit({ lastCompleted: "2026-09-01", streak: 8 }), TODAY).streak).toBe(1);
  });

  it("desmarcar hoje tira 1 e limpa o dia", () => {
    const next = toggleHabitToday(habit({ lastCompleted: TODAY, streak: 5 }), TODAY);
    expect(next).toMatchObject({ streak: 4, lastCompleted: undefined });
  });
});
