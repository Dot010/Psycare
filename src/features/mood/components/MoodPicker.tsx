"use client";

import { MoodFace } from "@/features/mood/components/MoodFace";
import { MOOD_LABELS, MOOD_LEVELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value?: MoodLevel;
  onChange: (level: MoodLevel) => void;
  /** Id do texto que nomeia o grupo (para leitores de tela). */
  labelledBy: string;
}

/** Cinco rostos: um toque escolhe o humor. */
export function MoodPicker({ value, onChange, labelledBy }: MoodPickerProps) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex justify-between gap-1">
      {MOOD_LEVELS.map((level) => {
        const active = value === level;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={MOOD_LABELS[level]}
            onClick={() => onChange(level)}
            className={cn(
              "flex size-12 items-center justify-center rounded-full border-2 bg-card transition-transform focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none sm:size-14",
              active ? "scale-110 border-brand-600" : "border-transparent hover:scale-105",
            )}
          >
            <MoodFace level={level} size={36} />
          </button>
        );
      })}
    </div>
  );
}
