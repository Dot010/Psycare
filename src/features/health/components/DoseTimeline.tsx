"use client";

import { Check } from "lucide-react";
import type { DoseItem } from "@/features/health/logic";
import { cn } from "@/lib/utils";

interface DoseTimelineProps {
  doses: DoseItem[];
  taken: string[];
  onToggle: (dose: DoseItem) => void;
}

/** Doses do dia numa linha do tempo. Marcar é um toque; desmarcar também. */
export function DoseTimeline({ doses, taken, onToggle }: DoseTimelineProps) {
  return (
    <ol aria-label="Doses de hoje" className="relative">
      <span aria-hidden className="absolute top-3 bottom-3 left-[21px] w-0.5 bg-brand-200" />
      {doses.map((dose) => {
        const done = taken.includes(dose.key);
        return (
          <li key={dose.key} className="relative flex items-center gap-4 py-2.5">
            <button
              type="button"
              aria-pressed={done}
              aria-label={`${done ? "Desmarcar" : "Marcar como tomado:"} ${dose.nome}, ${dose.time}`}
              onClick={() => onToggle(dose)}
              className={cn(
                "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                done
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-300 bg-canvas text-transparent hover:border-brand-600",
              )}
            >
              <Check className="size-5" aria-hidden />
            </button>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {dose.period} · {dose.time}
              </span>
              <span
                className={cn(
                  "text-lg font-medium",
                  done ? "text-muted-foreground line-through decoration-brand-300" : "text-foreground",
                )}
              >
                {dose.nome}
              </span>
              <span className="text-sm text-muted-foreground">
                {dose.dosagem}
                {dose.observacao ? `, ${dose.observacao}` : ""}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
