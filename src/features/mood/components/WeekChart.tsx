import { areaPath, CHART, smoothPath, weekPoints } from "@/features/mood/chart";
import { MOOD_LABELS } from "@/features/mood/logic";
import type { DayLevel } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { fromISODate } from "@/lib/dates";

const WEEKDAY = (iso: string) =>
  fromISODate(iso).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
const LETTER = (iso: string) => WEEKDAY(iso).charAt(0).toUpperCase();

function describe(days: DayLevel[]): string {
  const parts = days.map((day) =>
    day.level === null
      ? `${WEEKDAY(day.date)}: sem registro`
      : `${WEEKDAY(day.date)}: ${MOOD_LABELS[Math.round(day.level) as MoodLevel].toLowerCase()}`,
  );
  return `Humor dos últimos ${days.length} dias. ${parts.join("; ")}.`;
}

/** Curva do humor na semana, sem moldura. Dias sem registro ficam como um ponto pequeno na base. */
export function WeekChart({ days }: { days: DayLevel[] }) {
  const points = weekPoints(days);
  const known = points.filter((point) => point.level !== null);
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${CHART.height}`}
      className="h-auto w-full"
      role="img"
      aria-label={describe(days)}
    >
      <defs>
        <linearGradient id="week-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-600)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--color-brand-600)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {known.length > 1 && <path d={areaPath(known)} fill="url(#week-area)" />}
      {known.length > 1 && (
        <path
          d={smoothPath(known)}
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {points.map((point) =>
        point.level === null ? (
          <circle key={point.date} cx={point.x} cy={CHART.base - 6} r="2.5" fill="var(--color-border)" />
        ) : (
          <circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            r={point === last ? 7 : 4.5}
            fill={point === last ? "var(--color-background)" : "var(--color-brand-600)"}
            stroke="var(--color-brand-ink)"
            strokeWidth={point === last ? 3 : 0}
          />
        ),
      )}

      {points.map((point, index) => (
        <text
          key={point.date}
          x={point.x}
          y={192}
          textAnchor="middle"
          className={
            index === points.length - 1
              ? "fill-brand-ink text-xs font-semibold"
              : "fill-muted-foreground text-xs"
          }
        >
          {LETTER(point.date)}
        </text>
      ))}
    </svg>
  );
}
