"use client";

import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  Droplets,
  Smile,
  SquareCheckBig,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { ActionSheet, type SheetSnap } from "@/components/layout/ActionSheet";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger } from "@/components/motion/Stagger";
import { NextSessionCard } from "@/features/appointments/components/NextSessionCard";
import { Missions } from "@/features/missions/components/Missions";
import { Onboarding } from "@/features/onboarding/components/Onboarding";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { splitAppointments } from "@/features/appointments/logic";
import { useDiary } from "@/features/diary/hooks/useDiary";
import { Button } from "@/components/ui/button";
import { CheckIn } from "@/features/garden/components/CheckIn";
import { GardenScene } from "@/features/garden/components/GardenScene";
import { IntroHint } from "@/features/garden/components/IntroHint";
import { WaterCard } from "@/features/garden/components/WaterCard";
import { WaterHelp } from "@/features/garden/components/WaterHelp";
import { WeekStrip } from "@/features/garden/components/WeekStrip";
import { PLANT_NAMES } from "@/features/garden/logic";
import type { PlantKind } from "@/features/garden/types";
import { useGardenSound } from "@/features/garden/hooks/useGardenSound";
import { useGarden } from "@/features/garden/hooks/useGarden";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { toISODate } from "@/lib/dates";
import { useMediaQuery } from "@/lib/motion";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";

const SHEET_KEY = "psycare:home-sheet:v1";

const quickLinks = [
  { href: "/dashboard/diary", label: "Escrever no diário", icon: BookOpen },
  { href: "/dashboard/breathing", label: "Respirar um minuto", icon: Wind },
  { href: "/dashboard/habits", label: "Marcar hábitos", icon: SquareCheckBig },
  { href: "/dashboard/mood", label: "Ver meu humor", icon: Smile },
];

export default function HomeView() {
  const { habits } = useHabits();
  const { appointments } = useAppointments();
  const { entries } = useDiary();
  const garden = useGarden();
  const compact = useMediaQuery("(max-width: 767px)");
  const sound = useGardenSound();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A posição da gaveta é lembrada entre visitas.
  const [snap, setSnap] = useLocalStorage<SheetSnap>(SHEET_KEY, "half");

  const now = new Date();
  const { past } = splitAppointments(appointments, `${toISODate(now)}T${now.toTimeString().slice(0, 5)}`);
  const stats = [
    { label: "Hábitos ativos", value: habits.length },
    { label: "Consultas realizadas", value: past.filter((item) => item.status !== "cancelado").length },
    { label: "Entradas no diário", value: entries.length },
  ];

  const lift = snap === "peek" ? 0 : snap === "half" ? 0.6 : 1;

  const selectPlant = (kind: PlantKind) => {
    const plant = garden.plants.find((item) => item.kind === kind);
    if (!plant) return;
    setSelected(`${PLANT_NAMES[kind]} · ${Math.round(plant.growth * 100)}% crescido`);
    if (selectedTimer.current) clearTimeout(selectedTimer.current);
    selectedTimer.current = setTimeout(() => setSelected(null), 3500);
  };

  return (
    // Ocupa a tela toda (o -mb anula o espaço reservado do layout): o jardim é o fundo da página.
    <div className="relative -mb-28 h-screen overflow-hidden bg-gradient-to-b from-sun-50 via-brand-50 to-brand-100 md:-mb-8">
      <Onboarding />
      <div className="absolute inset-0">
        <GardenScene plants={garden.plants} lift={lift} onSelect={selectPlant} />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-[11] flex items-start justify-between gap-3 bg-gradient-to-b from-canvas/80 via-canvas/40 to-transparent p-4 pb-8 md:p-8 md:pb-10">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="line-clamp-2 break-words text-xl leading-tight font-bold text-ink md:text-2xl">
            Olá, {mockUser.name}
          </h1>
          <WaterHelp poured={garden.poured} toNext={garden.toNext}>
            <button
              type="button"
              className="pointer-events-auto flex w-fit items-center gap-2 rounded-full bg-card/85 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur transition-colors hover:bg-card focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
            >
              <Droplets className="size-3.5 text-brand-accent" aria-hidden />
              <span>
                <CountUp value={garden.poured} /> {garden.poured === 1 ? "gota" : "gotas"} no jardim
              </span>
              <CircleHelp className="size-3.5 text-muted-foreground" aria-label="Como o jardim cresce" />
            </button>
          </WaterHelp>
        </div>

        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <Button
            onClick={garden.pour}
            disabled={garden.available === 0 || garden.pouring}
            className="shadow-md"
          >
            <Droplets aria-hidden />
            {garden.pouring ? "Regando..." : "Regar"}
            {garden.available > 0 && !garden.pouring && (
              <span className="ml-1 rounded-full bg-white/25 px-1.5 text-xs font-bold">
                {garden.available}
              </span>
            )}
          </Button>
          <button
            type="button"
            role="switch"
            aria-checked={sound.enabled}
            aria-label="Som do jardim"
            onClick={sound.toggle}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card/85 text-foreground backdrop-blur transition-colors hover:bg-card focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
          >
            {sound.enabled ? (
              <Volume2 className="size-5" aria-hidden />
            ) : (
              <VolumeX className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 top-28 z-[1] flex flex-col items-center gap-2 px-4 md:top-32">
        {selected && (
          <p role="status" className="rounded-full bg-strong px-3 py-1.5 text-xs font-semibold text-white">
            {selected}
          </p>
        )}
        <IntroHint />
      </div>

      {/* No celular a barra de navegação cobre os 5rem de baixo; a gaveta fica acima dela. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-20 md:bottom-0">
        <ActionSheet
          className="pointer-events-auto"
          snap={snap}
          onSnapChange={setSnap}
          title="Seu painel de hoje"
          topInset={compact ? 112 : 124}
        >
          <Stagger className="space-y-8 pt-2">
            <WaterCard
              available={garden.available}
              pouring={garden.pouring}
              doneToday={garden.doneToday}
              toNext={garden.toNext}
              onPour={garden.pour}
            />

            <CheckIn today={garden.todayCheckIn} onSelect={garden.checkIn} onTagsChange={garden.setTags} />

            <Missions doneToday={garden.doneToday} />

            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex h-11 items-center justify-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-brand-600 hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none"
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Stagger>

          {/* O resto só aparece com a gaveta aberta: na metade ela fica enxuta. */}
          {snap === "full" ? (
            <Stagger key="more" className="space-y-8 pt-8">
              <WeekStrip days={garden.week} streak={garden.streak} />

              <dl className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse rounded-2xl bg-sunken p-4">
                    <dd className="text-3xl font-bold text-brand-accent">
                      <CountUp value={stat.value} />
                    </dd>
                    <dt className="mb-0 text-xs font-medium text-muted-foreground">{stat.label}</dt>
                  </div>
                ))}
              </dl>

              <NextSessionCard />

              <Link
                href="/dashboard/breathing"
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand-600"
              >
                <div>
                  <h2 className="text-base font-bold text-foreground">Um minuto para respirar</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Exercício guiado de 1 a 5 minutos.</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-brand-accent" aria-hidden />
              </Link>
            </Stagger>
          ) : (
            <p className="pt-6 text-center text-xs text-muted-foreground">
              Abra o painel para ver sua semana, números e próxima sessão.
            </p>
          )}
        </ActionSheet>
      </div>
    </div>
  );
}
