"use client";

import Link from "next/link";
import { useMood } from "@/features/mood/hooks/useMood";
import { averageOf, formatDecimal, lastLevels, MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { fromISODate } from "@/lib/dates";

/** Cor de cada nível: do bege (mais pesado) ao verde da marca (mais leve). */
const SHADE: Record<MoodLevel, string> = {
  1: "bg-taupe",
  2: "bg-brand-200",
  3: "bg-brand-300",
  4: "bg-brand-400",
  5: "bg-brand-600",
};

const letter = (iso: string) =>
  fromISODate(iso).toLocaleDateString("pt-BR", { weekday: "short" }).charAt(0).toLowerCase();

/** A semana do humor em barrinhas. O detalhe fica na página Meu humor. */
export function WeekMini() {
  const { levels, today } = useMood();
  const week = lastLevels(levels, today, 7);
  const average = averageOf(week);
  const label = week
    .map((day, i) =>
      day.level === null
        ? `${i === 6 ? "hoje" : letter(day.date)}: sem registro`
        : `${i === 6 ? "hoje" : letter(day.date)}: ${MOOD_LABELS[Math.round(day.level) as MoodLevel].toLowerCase()}`,
    )
    .join("; ");

  return (
    <section aria-labelledby="week-title" className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="week-title" className="text-base font-medium text-ink">
          <Link href="/dashboard/diary?aba=humor" className="hover:underline">
            Sua semana
          </Link>
        </h2>
        <span className="text-sm text-muted-foreground">
          {average === null ? "sem registros" : `média ${formatDecimal(average)}`}
        </span>
      </div>
      <div
        role="img"
        aria-label={`Humor por dia. ${label}.`}
        className="mt-4 grid h-16 grid-cols-7 items-end gap-2"
      >
        {week.map((day, i) =>
          day.level === null ? (
            <span key={day.date} className="h-2 rounded-full border-[1.5px] border-dashed border-taupe" />
          ) : (
            <span
              key={day.date}
              className={`animate-grow-up rounded-full ${SHADE[Math.round(day.level) as MoodLevel]}`}
              style={{ height: `${(day.level / 5) * 100}%`, animationDelay: `${i * 60}ms` }}
            />
          ),
        )}
      </div>
      <div aria-hidden className="mt-2 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
        {week.map((day, i) => (
          <span key={day.date} className={i === 6 ? "font-semibold text-ink" : undefined}>
            {i === 6 ? "hoje" : letter(day.date)}
          </span>
        ))}
      </div>
    </section>
  );
}
