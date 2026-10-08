import { describe, expect, it } from "vitest";
import { areaPath, CHART, levelToY, smoothPath, weekPoints } from "@/features/mood/chart";

describe("gráfico da semana", () => {
  it("põe o 5 no alto e o 1 embaixo", () => {
    expect(levelToY(5)).toBe(CHART.top);
    expect(levelToY(1)).toBe(CHART.bottom);
    expect(levelToY(3)).toBe((CHART.top + CHART.bottom) / 2);
  });

  it("espaça os dias e deixa o dia sem registro na base", () => {
    const points = weekPoints([
      { date: "a", level: 3 },
      { date: "b", level: null },
    ]);
    expect(points[0].x).toBe(CHART.left);
    expect(points[1].x).toBe(CHART.left + CHART.step);
    expect(points[1].y).toBe(CHART.base);
    expect(points[1].level).toBeNull();
  });

  it("desenha a curva e a área", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([{ x: 30, y: 94 }])).toBe("M30,94");
    expect(
      smoothPath([
        { x: 30, y: 94 },
        { x: 85, y: 122 },
      ]),
    ).toBe("M30,94 C57.5,94 57.5,122 85,122");
    expect(areaPath([{ x: 30, y: 94 }])).toBe("");
    expect(
      areaPath([
        { x: 30, y: 94 },
        { x: 85, y: 122 },
      ]),
    ).toMatch(/L85,170 L30,170 Z$/);
  });
});
