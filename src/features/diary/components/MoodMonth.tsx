"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import type { DiaryEntry } from "@/features/diary/types";
import { MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { monthWeeks } from "@/features/planner/logic";
import { cn } from "@/lib/utils";

/** Do mais pesado (bege) ao mais leve (verde da marca), igual à semana do Início. */
const SHADE: Record<MoodLevel, string> = {
  1: "bg-taupe text-ink",
  2: "bg-brand-200 text-ink",
  3: "bg-brand-300 text-ink",
  4: "bg-brand-400 text-white",
  5: "bg-brand-600 text-white",
};

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const WEEKDAYS = ["d", "s", "t", "q", "q", "s", "s"];

function pages(count: number): string {
  return count === 1 ? "1 página" : `${count} páginas`;
}

interface MoodMonthProps {
  /** Humor de cada dia (AAAA-MM-DD → 1 a 5), já juntando check-in e diário. */
  levels: Map<string, number>;
  entries: DiaryEntry[];
  today: string;
}

/**
 * O mês de uma vez: cada dia vira um quadradinho na cor do humor.
 * Tocar num dia mostra o que foi escrito nele, ao lado.
 */
export function MoodMonth({ levels, entries, today }: MoodMonthProps) {
  const [year, month] = today.split("-").map(Number);
  const [view, setView] = useState({ year, month: month - 1 });
  const [selected, setSelected] = useState(today);
  const weeks = monthWeeks(view.year, view.month);
  const isCurrentMonth = view.year === year && view.month === month - 1;
  const recorded = weeks.flat().filter((d): d is string => !!d && levels.has(d)).length;

  const move = (delta: number) =>
    setView((current) => {
      const d = new Date(current.year, current.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const level = levels.get(selected);
  const chosen = entries.filter((e) => e.date === selected);
  const [, sm, sd] = selected.split("-").map(Number);

  return (
    <Block tone="sand" size="lg" label="Seu mês">
      <div className="flex flex-wrap gap-6">
        <div className="min-w-0 flex-1 basis-72 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => move(-1)}>
              <ChevronLeft />
            </Button>
            <div className="text-center">
              <h2 className="text-xl font-medium">
                {MONTHS[view.month].charAt(0).toUpperCase() + MONTHS[view.month].slice(1)} de {view.year}
              </h2>
              <p className="text-sm text-muted-foreground">
                {recorded === 1 ? "1 dia com registro" : `${recorded} dias com registro`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Próximo mês"
              disabled={isCurrentMonth}
              onClick={() => move(1)}
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground" aria-hidden>
            {WEEKDAYS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weeks.flat().map((date, i) => {
              if (!date) return <span key={i} />;
              const day = Number(date.slice(8));
              const lv = levels.get(date);
              const shade = lv ? SHADE[Math.round(lv) as MoodLevel] : undefined;
              const future = date > today;
              const count = entries.filter((e) => e.date === date).length;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={future}
                  aria-pressed={selected === date}
                  aria-label={`${day} de ${MONTHS[view.month]}: ${lv ? MOOD_LABELS[Math.round(lv) as MoodLevel].toLowerCase() : "sem humor registrado"}, ${pages(count)}`}
                  onClick={() => setSelected(date)}
                  style={{ animationDelay: `${day * 18}ms` }}
                  className={cn(
                    "animate-pop-in flex aspect-square min-h-9 items-center justify-center rounded-xl text-xs font-medium transition-shadow focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                    shade ??
                      (future
                        ? "border border-dashed border-taupe text-taupe"
                        : "border border-border bg-card"),
                    selected === date && "ring-2 ring-ink ring-offset-2 ring-offset-canvas",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-hidden>
            mais pesado
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((l) => (
              <span key={l} className={cn("size-3.5 rounded", SHADE[l])} />
            ))}
            mais leve
          </p>
        </div>

        <div
          className="min-w-0 flex-1 basis-56 space-y-2 self-stretch rounded-2xl bg-sunken p-5"
          aria-live="polite"
        >
          <p className="text-sm text-muted-foreground">
            {sd} de {MONTHS[sm - 1]}
          </p>
          <p className="text-lg font-medium">
            {level ? MOOD_LABELS[Math.round(level) as MoodLevel] : "Sem humor registrado"}
          </p>
          {chosen.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada escrito nesse dia. Tudo bem também.</p>
          ) : (
            <ul className="space-y-2">
              {chosen.map((e) => (
                <li
                  key={e.id}
                  className="border-t border-sunken pt-2 text-sm leading-relaxed first:border-t-0"
                >
                  <span className="font-medium">
                    {e.kind === "drawing" ? `Desenho: ${e.title}` : e.title}
                  </span>
                  {e.kind !== "drawing" && e.content !== e.title && (
                    <span className="mt-0.5 line-clamp-3 block text-muted-foreground">{e.content}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Block>
  );
}
