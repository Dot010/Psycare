"use client";

import { Check } from "lucide-react";
import { MOODS } from "@/features/diary/utils";
import { cn } from "@/lib/utils";

interface CheckInProps {
  mood?: string;
  onSelect: (mood: string) => void;
}

/** "Como você está agora?": um toque, uma vez por dia (pode trocar), e o jardim ganha água. */
export function CheckIn({ mood, onSelect }: CheckInProps) {
  return (
    <section aria-labelledby="checkin-title" className="space-y-3">
      <div>
        <h2 id="checkin-title" className="text-base font-bold text-foreground">
          Como você está agora?
        </h2>
        <p className="text-xs text-muted-foreground">
          {mood ? `Hoje: ${mood}. Pode mudar se sentir diferente.` : "Um toque e seu jardim ganha água."}
        </p>
      </div>
      <div role="group" aria-labelledby="checkin-title" className="flex flex-wrap gap-2">
        {MOODS.map((option) => {
          const active = mood === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option)}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none",
                active
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-input bg-card text-foreground hover:border-brand-600",
              )}
            >
              {active && <Check className="size-3.5" aria-hidden />}
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
