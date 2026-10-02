import { describe, expect, it } from "vitest";
import { getHabitStats } from "./stats";

const habit = (completedToday: boolean, streak: number) => ({
  id: crypto.randomUUID(),
  title: "x",
  category: "Saúde",
  completedToday,
  streak,
});

describe("getHabitStats", () => {
  it("lista vazia não gera NaN", () => {
    expect(getHabitStats([])).toEqual({ total: 0, completed: 0, successRate: 0, longestStreak: 0 });
  });

  it("conta concluídos, arredonda a taxa e acha a maior sequência", () => {
    const stats = getHabitStats([habit(true, 3), habit(false, 9), habit(false, 1)]);
    expect(stats).toEqual({ total: 3, completed: 1, successRate: 33, longestStreak: 9 });
  });
});
