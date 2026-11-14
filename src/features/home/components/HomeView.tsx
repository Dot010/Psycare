"use client";

import { Stagger } from "@/components/motion/Stagger";
import { DayPlan } from "@/features/home/components/DayPlan";
import { SessionMini } from "@/features/home/components/SessionMini";
import { TodayDoses } from "@/features/home/components/TodayDoses";
import { WeekMini } from "@/features/home/components/WeekMini";
import { timeGreeting } from "@/features/home/logic";
import { useGarden } from "@/features/garden/hooks/useGarden";
import { Onboarding } from "@/features/onboarding/components/Onboarding";
import { useProfile } from "@/features/profile/useProfile";

/**
 * Início do paciente. A tela responde "o que eu faço agora?":
 * à esquerda o dia (o que fazer), à direita o que tem hora ou é só para olhar.
 * O jardim 3D tem página própria (/dashboard/garden), aberta pelo selo de gotas.
 */
export default function HomeView() {
  const garden = useGarden();
  const [profile] = useProfile();
  const now = new Date();
  const dateLabel = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <Onboarding />

      <header className="space-y-1">
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          {dateLabel}
        </p>
        <h1
          className="text-4xl leading-tight font-light tracking-tight break-words text-ink md:text-5xl"
          suppressHydrationWarning
        >
          {timeGreeting(profile.name, now.getHours())}
        </h1>
      </header>

      <Stagger className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <DayPlan
          todayCheckIn={garden.todayCheckIn}
          doneToday={garden.doneToday}
          drops={garden.poured + garden.available}
          onCheckIn={garden.checkIn}
          onTagsChange={garden.setTags}
        />

        <Stagger className="min-w-0 space-y-5">
          <SessionMini />
          <TodayDoses />
          <WeekMini />
        </Stagger>
      </Stagger>
    </div>
  );
}
