import { getAnxietyTrend } from "@/features/diary/utils";
import type { DiaryEntry } from "@/features/diary/types";

const WIDTH = 560;
const HEIGHT = 140;
const PAD = { top: 12, right: 12, bottom: 24, left: 28 };

interface MoodChartProps {
  entries: DiaryEntry[];
  today: string;
}

/** Linha com a média diária de ansiedade (1 a 5) nas últimas duas semanas. */
export function MoodChart({ entries, today }: MoodChartProps) {
  const trend = getAnxietyTrend(entries, today, 14);
  const withData = trend.filter((point) => point.average !== null);
  if (withData.length < 2) return null;

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (index / (trend.length - 1)) * innerW;
  const y = (value: number) => PAD.top + (1 - (value - 1) / 4) * innerH;

  const points = trend.flatMap((point, index) =>
    point.average === null
      ? []
      : [{ x: x(index), y: y(point.average), value: point.average, date: point.date }],
  );
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const average = points.reduce((sum, p) => sum + p.value, 0) / points.length;

  return (
    <figure className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">Ansiedade nos últimos 14 dias</span>
        <span className="text-xs text-muted-foreground">
          Média: {average.toFixed(1)} de 5 (menor é mais leve)
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Média de ansiedade nos últimos 14 dias: ${average.toFixed(1)} de 5, com ${points.length} dias registrados.`}
      >
        {[1, 3, 5].map((level) => (
          <g key={level}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(level)}
              y2={y(level)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text
              x={PAD.left - 8}
              y={y(level) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-xs"
            >
              {level}
            </text>
          </g>
        ))}
        <path
          d={path}
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="var(--color-sun-300)"
            stroke="var(--color-brand-600)"
            strokeWidth={2}
          />
        ))}
        <text x={PAD.left} y={HEIGHT - 4} className="fill-muted-foreground text-xs">
          14 dias atrás
        </text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 4} textAnchor="end" className="fill-muted-foreground text-xs">
          hoje
        </text>
      </svg>
    </figure>
  );
}
