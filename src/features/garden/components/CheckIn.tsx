"use client";

import { MoodPicker } from "@/features/mood/components/MoodPicker";
import { TagPicker } from "@/features/mood/components/TagPicker";
import { checkInLevel } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import type { CheckIn as CheckInRecord } from "@/features/garden/types";

interface CheckInProps {
  today?: CheckInRecord;
  onSelect: (level: MoodLevel) => void;
  onTagsChange: (tags: string[]) => void;
}

/** "Como você está agora?": um toque, uma vez por dia (pode trocar), e o jardim ganha água. */
export function CheckIn({ today, onSelect, onTagsChange }: CheckInProps) {
  const level = today ? checkInLevel(today) : undefined;

  return (
    <section aria-labelledby="checkin-title" className="space-y-4">
      <div>
        <h2 id="checkin-title" className="text-base font-bold text-foreground">
          Como você está agora?
        </h2>
        <p className="text-xs text-muted-foreground">
          {today
            ? `Hoje: ${today.mood}. Pode mudar se sentir diferente.`
            : "Um toque e seu jardim ganha água."}
        </p>
      </div>

      <MoodPicker value={level} onChange={onSelect} labelledBy="checkin-title" />

      {today && (
        <div className="space-y-2">
          <p id="checkin-tags" className="text-xs font-medium text-muted-foreground">
            O que influenciou? (se quiser)
          </p>
          <TagPicker value={today.tags ?? []} onChange={onTagsChange} />
        </div>
      )}
    </section>
  );
}
