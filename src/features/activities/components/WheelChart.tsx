import { WHEEL_AREAS } from "../catalog";
import type { WheelRow } from "../logic";

const CX = 170;
const CY = 170;
const R = 120;
const MAX = 10;

function point(index: number, value: number, radius = R) {
  const angle = (index / WHEEL_AREAS.length) * Math.PI * 2 - Math.PI / 2;
  const r = (value / MAX) * radius;
  return { x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r };
}

function polygon(values: number[]) {
  return values
    .map((value, i) => {
      const p = point(i, value);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

function labelAnchor(index: number): "start" | "middle" | "end" {
  const x = point(index, MAX, R).x;
  if (Math.abs(x - CX) < 4) return "middle";
  return x > CX ? "start" : "end";
}

/** Gráfico de teia da roda da vida. Com `rows[].before`, desenha também a vez anterior tracejada. */
export function WheelChart({ rows, label }: { rows: WheelRow[]; label: string }) {
  const hasBefore = rows.some((row) => row.before !== null);
  return (
    <svg viewBox="0 0 340 340" width="100%" role="img" aria-label={label} className="max-w-sm">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={polygon(WHEEL_AREAS.map(() => MAX * scale))}
          fill="none"
          className="stroke-border"
        />
      ))}
      {WHEEL_AREAS.map((area, i) => {
        const end = point(i, MAX);
        return <line key={area} x1={CX} y1={CY} x2={end.x} y2={end.y} className="stroke-border" />;
      })}
      {hasBefore && (
        <polygon
          points={polygon(rows.map((row) => row.before ?? 0))}
          fill="none"
          className="stroke-sun-700"
          strokeWidth={2.5}
          strokeDasharray="6 5"
          strokeLinejoin="round"
        />
      )}
      <polygon
        points={polygon(rows.map((row) => row.now))}
        className="fill-brand-600/20 stroke-brand-600"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {WHEEL_AREAS.map((area, i) => {
        const p = point(i, MAX, R + 16);
        return (
          <text
            key={area}
            x={p.x}
            y={p.y + 4}
            textAnchor={labelAnchor(i)}
            className="fill-foreground"
            fontSize={12.5}
          >
            {area}
          </text>
        );
      })}
    </svg>
  );
}
