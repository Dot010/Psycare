import type { DayLevel } from "@/features/mood/logic";

export interface Point {
  x: number;
  y: number;
}

/** Medidas do gráfico da semana (viewBox 390 x 200). */
export const CHART = {
  width: 390,
  height: 200,
  left: 30,
  step: 55,
  top: 38,
  bottom: 150,
  base: 170,
} as const;

/** Altura de um humor de 1 a 5 no gráfico (5 no alto). */
export function levelToY(level: number): number {
  return CHART.bottom - ((level - 1) / 4) * (CHART.bottom - CHART.top);
}

export interface WeekPoint extends Point {
  date: string;
  level: number | null;
}

/** Um ponto por dia. Dia sem registro fica na base, com `level: null`. */
export function weekPoints(days: DayLevel[]): WeekPoint[] {
  return days.map((day, index) => ({
    date: day.date,
    level: day.level,
    x: CHART.left + index * CHART.step,
    y: day.level === null ? CHART.base : levelToY(day.level),
  }));
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Curva suave (cúbica) passando pelos pontos, com as alças na horizontal. */
export function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  let path = `M${round(first.x)},${round(first.y)}`;
  let previous = first;
  for (const point of rest) {
    const middle = (previous.x + point.x) / 2;
    path += ` C${round(middle)},${round(previous.y)} ${round(middle)},${round(point.y)} ${round(point.x)},${round(point.y)}`;
    previous = point;
  }
  return path;
}

/** Fecha a curva até a base para pintar a área embaixo dela. */
export function areaPath(points: Point[]): string {
  if (points.length < 2) return "";
  const last = points[points.length - 1];
  const first = points[0];
  return `${smoothPath(points)} L${round(last.x)},${CHART.base} L${round(first.x)},${CHART.base} Z`;
}
