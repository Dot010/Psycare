import type { WeekDay } from "@/features/health/logic";
import { cn } from "@/lib/utils";

const STATE_LABEL = {
  full: "todas as doses",
  part: "algumas doses",
  none: "nenhuma dose",
  empty: "sem doses",
} as const;

export function WeekDots({ days }: { days: WeekDay[] }) {
  return (
    <ul className="flex items-end gap-3" aria-label="Doses da semana">
      {days.map((day) => (
        <li key={day.date} className="flex flex-col items-center gap-1.5">
          <span
            role="img"
            aria-label={`${day.letter}${day.isToday ? " (hoje)" : ""}: ${STATE_LABEL[day.state]}`}
            className={cn(
              "size-7 rounded-full border-2",
              day.state === "full" && "border-brand-600 bg-brand-600",
              day.state === "part" && "border-brand-600 bg-brand-200",
              (day.state === "none" || day.state === "empty") && "border-brand-300 bg-transparent",
              day.isToday && "ring-2 ring-brand-ink ring-offset-2 ring-offset-canvas",
            )}
          />
          <span className="text-xs text-muted-foreground">{day.letter}</span>
        </li>
      ))}
    </ul>
  );
}
