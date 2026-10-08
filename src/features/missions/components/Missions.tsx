"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { grantWater } from "@/features/garden/water";
import type { WaterSource } from "@/features/garden/types";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { cn } from "@/lib/utils";
import {
  isMissionDone,
  MISSIONS_KEY,
  missionsForDay,
  missionSentence,
  NO_MISSIONS,
  toggleManual,
} from "../logic";

/** Três pequenas missões do dia. Cumprir rende uma gota extra; deixar de cumprir não tira nada. */
export function Missions({ doneToday }: { doneToday: Set<WaterSource> }) {
  const [state, setState] = useLocalStorage(MISSIONS_KEY, NO_MISSIONS);
  const today = toISODate(new Date());
  const missions = missionsForDay(today);
  const statuses = missions.map((m) => isMissionDone(m, state, today, doneToday));
  const doneCount = statuses.filter(Boolean).length;

  // A gota da missão sai uma vez por dia por missão, mesmo se desmarcar e marcar de novo.
  const doneKey = missions
    .filter((_, i) => statuses[i])
    .map((m) => m.id)
    .join(",");
  useEffect(() => {
    if (!doneKey) return;
    for (const id of doneKey.split(",")) grantWater("mission", id);
  }, [doneKey]);

  return (
    <section aria-labelledby="missions-title" className="space-y-2">
      <h2 id="missions-title" className="text-base font-bold text-foreground">
        Missões de hoje
      </h2>
      <p className="text-xs text-muted-foreground">{missionSentence(doneCount, missions.length)}</p>
      <ul>
        {missions.map((mission, i) => {
          const done = statuses[i];
          const body = (
            <span className={cn("text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>
              {mission.text}
            </span>
          );
          return (
            <li key={mission.id} className="flex min-h-12 items-center gap-3 border-t border-border py-1.5">
              {mission.auto ? (
                <span
                  role="img"
                  aria-label={done ? "Cumprida" : "Ainda não"}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                    done ? "border-brand-600 bg-brand-600 text-white" : "border-brand-300",
                  )}
                >
                  {done && <Check className="size-4" aria-hidden />}
                </span>
              ) : (
                <button
                  type="button"
                  aria-pressed={done}
                  aria-label={`${done ? "Desmarcar" : "Marcar como feita"}: ${mission.text}`}
                  onClick={() => setState((current) => toggleManual(current, mission.id, today))}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                    done
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-brand-300 hover:border-brand-600",
                  )}
                >
                  {done && <Check className="size-4" aria-hidden />}
                </button>
              )}
              {mission.href && !done ? (
                <Link href={mission.href} className="underline-offset-2 hover:underline">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
