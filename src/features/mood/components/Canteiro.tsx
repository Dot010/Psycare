import { FlowerGlyph } from "@/features/mood/components/FlowerGlyph";
import { MOOD_LABELS, monthGrid } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface CanteiroProps {
  levels: Map<string, number>;
  today: string;
}

function describeDay(day: number, level: number | null, isFuture: boolean): string {
  if (isFuture) return `Dia ${day}: ainda não chegou`;
  if (level === null) return `Dia ${day}: sem registro`;
  return `Dia ${day}: ${MOOD_LABELS[Math.round(level) as MoodLevel].toLowerCase()}`;
}

/** O mês como um canteiro: cada dia é uma flor, maior e mais amarela nos dias mais leves. */
export function Canteiro({ levels, today }: CanteiroProps) {
  const cells = monthGrid(levels, today);

  return (
    <div>
      <div aria-hidden className="mb-1 grid grid-cols-7 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, index) =>
          cell === null ? (
            <li key={`pad-${index}`} aria-hidden />
          ) : (
            <li
              key={cell.date}
              aria-label={describeDay(cell.day, cell.level, cell.isFuture)}
              aria-current={cell.isToday ? "date" : undefined}
              className={cn("flex flex-col items-center", cell.isFuture && "opacity-35")}
            >
              <FlowerGlyph level={cell.isFuture ? null : cell.level} className="h-14 w-full max-w-10" />
              <span
                className={cn(
                  "mt-0.5 text-[11px] leading-none",
                  cell.isToday ? "font-bold text-brand-ink" : "text-muted-foreground",
                )}
              >
                {cell.day}
              </span>
            </li>
          ),
        )}
      </ol>
    </div>
  );
}
