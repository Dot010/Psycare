"use client";

import { HardMoment } from "@/features/safety/components/HardMoment";
import { Check, Droplets } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { Button } from "@/components/ui/button";
import type { CheckIn, WaterSource } from "@/features/garden/types";
import { grantWater } from "@/features/garden/water";
import {
  isMissionDone,
  type Mission,
  MISSIONS_KEY,
  missionsForDay,
  NO_MISSIONS,
  toggleManual,
} from "@/features/missions/logic";
import { MoodFace } from "@/features/mood/components/MoodFace";
import { TagPicker } from "@/features/mood/components/TagPicker";
import { checkInLevel, MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { cn } from "@/lib/utils";

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

const ACTION_LABEL: Partial<Record<WaterSource, string>> = {
  diary: "Abrir o diário",
  breathing: "Começar a respirar",
  habit: "Ver meus hábitos",
};

const HINT: Record<string, string> = {
  diario: "Uma linha já basta.",
  respirar: "Um minuto para desacelerar.",
  habito: "Qualquer hábito da sua lista.",
};

interface Step {
  id: string;
  title: string;
  hint: string;
  done: boolean;
  mission?: Mission;
}

interface DayPlanProps {
  todayCheckIn?: CheckIn;
  doneToday: Set<WaterSource>;
  /** Total de gotas que a pessoa já ganhou (despejadas + no regador). */
  drops: number;
  onCheckIn: (level: MoodLevel) => void;
  /** "Hoje está difícil": mostra só o registro de humor, sem as missões. */
  essential?: boolean;
  onTagsChange: (tags: string[]) => void;
}

/** "Seu dia": o check-in e as missões de hoje numa lista só. Fica aberto só o passo da vez. */
export function DayPlan({
  todayCheckIn,
  doneToday,
  drops,
  onCheckIn,
  onTagsChange,
  essential = false,
}: DayPlanProps) {
  const [state, setState] = useLocalStorage(MISSIONS_KEY, NO_MISSIONS);
  // undefined = abre sozinho o primeiro passo pendente; "" = tudo fechado.
  const [open, setOpen] = useState<string | undefined>(undefined);
  // Rascunho do check-in: só vale quando a pessoa clica em Registrar.
  const [draftLevel, setDraftLevel] = useState<MoodLevel | undefined>(
    todayCheckIn ? checkInLevel(todayCheckIn) : undefined,
  );
  const [draftTags, setDraftTags] = useState<string[]>(todayCheckIn?.tags ?? []);

  const today = toISODate(new Date());
  const missions = missionsForDay(today);
  const statuses = missions.map((m) => isMissionDone(m, state, today, doneToday));

  // A gota da missão sai uma vez por dia por missão, mesmo se desmarcar e marcar de novo.
  const doneKey = missions
    .filter((_, i) => statuses[i])
    .map((m) => m.id)
    .join(",");
  useEffect(() => {
    if (!doneKey) return;
    for (const id of doneKey.split(",")) grantWater("mission", id);
  }, [doneKey]);

  const allSteps: Step[] = [
    {
      id: "checkin",
      title: "Como você está?",
      hint: todayCheckIn ? `Registrado: ${todayCheckIn.mood.toLowerCase()}` : "Leva 10 segundos.",
      done: Boolean(todayCheckIn),
    },
    ...missions
      .map((mission, i) => ({ mission, done: statuses[i] }))
      .filter(({ mission }) => mission.id !== "checkin")
      .map(({ mission, done }) => ({
        id: mission.id,
        title: mission.text,
        hint: done ? "Feito hoje." : (HINT[mission.id] ?? "Um gesto pequeno, no seu tempo."),
        done,
        mission,
      })),
  ];

  const steps = essential ? allSteps.slice(0, 1) : allSteps;
  const doneCount = steps.filter((step) => step.done).length;
  const firstPending = steps.find((step) => !step.done)?.id ?? "";
  const expanded = open ?? firstPending;

  const register = () => {
    if (!draftLevel) return;
    onCheckIn(draftLevel);
    onTagsChange(draftTags);
    setOpen(undefined);
  };

  return (
    <section aria-labelledby="day-title" className="rounded-3xl border border-border bg-card p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="day-title" className="text-2xl font-light tracking-tight text-ink">
            Seu dia
          </h2>
          <p className="text-sm text-muted-foreground">
            {doneCount === steps.length
              ? "Tudo feito por hoje. O jardim agradece."
              : `${doneCount} de ${steps.length} feitos · um passo de cada vez`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Passos de hoje"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={doneCount}
            className="h-2.5 w-28 overflow-hidden rounded-full bg-brand-100"
          >
            <div
              className="h-full animate-grow-x rounded-full bg-brand-600 transition-[width] duration-300"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
          <Link
            href="/dashboard/garden"
            className="flex min-h-9 items-center gap-1.5 rounded-full bg-sun-300 px-3 text-sm font-semibold text-ink pointer-coarse:min-h-11 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
          >
            <Droplets className="size-3.5" aria-hidden />
            <CountUp value={drops} /> {drops === 1 ? "gota" : "gotas"}
            <span className="sr-only">: ver meu refúgio</span>
          </Link>
        </div>
      </div>

      {todayCheckIn?.level !== undefined && (
        <div className="mt-4">
          <HardMoment level={todayCheckIn.level} />
        </div>
      )}

      <ol className="mt-5">
        {steps.map((step, index) => {
          const isOpen = expanded === step.id;
          return (
            <li key={step.id} className="border-t border-border py-3">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`step-${step.id}`}
                aria-describedby={`hint-${step.id}`}
                onClick={() => setOpen(isOpen ? "" : step.id)}
                className="flex min-h-12 w-full items-center gap-4 rounded-2xl text-left focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    step.done
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-brand-400 text-brand-ink",
                  )}
                >
                  {step.done ? <Check className="size-4 animate-pop" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-medium text-foreground">
                    {step.title}
                    <span className="sr-only">{step.done ? " (feito)" : " (pendente)"}</span>
                  </span>
                  <span id={`hint-${step.id}`} aria-hidden className="block text-sm text-muted-foreground">
                    {step.hint}
                  </span>
                </span>
                <span aria-hidden className="shrink-0 text-sm text-muted-foreground">
                  +1 gota
                </span>
              </button>

              {isOpen && (
                <div id={`step-${step.id}`} className="space-y-4 pt-3 pb-1 md:pl-12">
                  {step.id === "checkin" ? (
                    <>
                      <div
                        role="radiogroup"
                        aria-label="Como você está?"
                        className="grid max-w-md grid-cols-5 gap-2"
                      >
                        {LEVELS.map((level) => {
                          const active = draftLevel === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setDraftLevel(level)}
                              className={cn(
                                "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border px-1 text-center text-[0.7rem] leading-tight transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                                active
                                  ? "border-2 border-brand-600 bg-brand-100 font-semibold text-brand-ink"
                                  : "border-border bg-canvas text-muted-foreground hover:border-brand-400",
                              )}
                            >
                              <MoodFace level={level} size={28} />
                              {MOOD_LABELS[level]}
                            </button>
                          );
                        })}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">O que mais influenciou? (se quiser)</p>
                        <TagPicker value={draftTags} onChange={setDraftTags} />
                      </div>
                      <Button
                        size="lg"
                        onClick={register}
                        disabled={!draftLevel}
                        className="bg-strong px-6 hover:bg-strong/90"
                      >
                        {todayCheckIn ? "Atualizar humor" : "Registrar humor"}
                      </Button>
                    </>
                  ) : step.mission?.auto ? (
                    step.done ? (
                      <p className="text-sm text-muted-foreground">Feito hoje.</p>
                    ) : (
                      step.mission.href && (
                        <Button size="lg" asChild className="bg-strong px-6 hover:bg-strong/90">
                          <Link href={step.mission.href}>{ACTION_LABEL[step.mission.auto] ?? "Abrir"}</Link>
                        </Button>
                      )
                    )
                  ) : (
                    <Button
                      size="lg"
                      variant={step.done ? "outline" : "default"}
                      className={step.done ? "px-6" : "bg-strong px-6 hover:bg-strong/90"}
                      onClick={() => {
                        setState((current) => toggleManual(current, step.id, today));
                        setOpen(undefined);
                      }}
                    >
                      {step.done ? "Desmarcar" : "Marcar como feito"}
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
