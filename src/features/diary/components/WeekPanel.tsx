"use client";

import { useState } from "react";
import type { DiaryEntry } from "@/features/diary/types";
import { weekDays, writtenDays } from "@/features/diary/utils";
import { MoodFace } from "@/features/mood/components/MoodFace";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAMES = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function weekSentence(days: number): string {
  if (days === 0) return "Esta semana ainda está em branco. Sem pressão.";
  if (days === 1) return "Você escreveu em 1 dia da última semana.";
  return `Você escreveu em ${days} dias da última semana.`;
}

/** A semana de relance: um rosto por dia, e as páginas do dia escolhido. */
export function WeekPanel({ entries }: { entries: DiaryEntry[] }) {
  const today = toISODate(new Date());
  const days = weekDays(entries, today);
  const [selected, setSelected] = useState(today);
  const chosen = entries.filter((e) => e.date === selected);

  return (
    <div className="space-y-5">
      <p className="text-base text-foreground">{weekSentence(writtenDays(entries, today))}</p>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const [y, m, d] = day.date.split("-").map(Number);
          const name = NAMES[new Date(y, m - 1, d).getDay()];
          return (
            <button
              key={day.date}
              type="button"
              aria-pressed={selected === day.date}
              aria-label={`${formatDateBR(day.date).slice(0, 5)}, ${day.count} ${day.count === 1 ? "página" : "páginas"}`}
              onClick={() => setSelected(day.date)}
              className={cn(
                "flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border text-xs transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                selected === day.date
                  ? "border-brand-600 bg-brand-100"
                  : "border-border hover:border-brand-600",
              )}
            >
              <span className="text-muted-foreground">{name}</span>
              {day.level ? (
                <MoodFace level={day.level} size={28} />
              ) : (
                <span aria-hidden className="size-7 rounded-full bg-sunken" />
              )}
              <span className="font-medium">{d}</span>
            </button>
          );
        })}
      </div>
      <section aria-label={`Páginas de ${formatDateBR(selected)}`} className="space-y-2">
        {chosen.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma página neste dia.</p>
        ) : (
          <ul>
            {chosen.map((e) => (
              <li key={e.id} className="border-t border-border py-3">
                <p className="text-lg font-medium text-foreground">{e.title}</p>
                <p className="text-sm text-muted-foreground">{e.kind === "drawing" ? "Desenho" : e.mood}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
