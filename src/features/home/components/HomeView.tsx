"use client";

import { ArrowRight, BookOpen, Droplets, Wind } from "lucide-react";
import Link from "next/link";
import { ActionSheet, type SheetSnap } from "@/components/layout/ActionSheet";
import { CountUp } from "@/components/motion/CountUp";
import { Stagger } from "@/components/motion/Stagger";
import { NextSessionCard } from "@/features/appointments/components/NextSessionCard";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { splitAppointments } from "@/features/appointments/logic";
import { useDiary } from "@/features/diary/hooks/useDiary";
import { CheckIn } from "@/features/garden/components/CheckIn";
import { GardenScene } from "@/features/garden/components/GardenScene";
import { WeekStrip } from "@/features/garden/components/WeekStrip";
import { useGarden } from "@/features/garden/hooks/useGarden";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { cn } from "@/lib/utils";
import { mockUser } from "@/mocks/user";

const SHEET_KEY = "psycare:home-sheet:v1";

const quickLinks = [
  { href: "/dashboard/diary", label: "Escrever no diário", icon: BookOpen },
  { href: "/dashboard/breathing", label: "Respirar um minuto", icon: Wind },
  { href: "/dashboard/habits", label: "Marcar hábitos", icon: Droplets },
];

export default function HomeView() {
  const { habits } = useHabits();
  const { appointments } = useAppointments();
  const { entries } = useDiary();
  const garden = useGarden();
  // A posição da gaveta é lembrada entre visitas.
  const [snap, setSnap] = useLocalStorage<SheetSnap>(SHEET_KEY, "half");

  const now = new Date();
  const { past } = splitAppointments(appointments, `${toISODate(now)}T${now.toTimeString().slice(0, 5)}`);
  const stats = [
    { label: "Hábitos ativos", value: habits.length },
    { label: "Consultas realizadas", value: past.filter((item) => item.status !== "cancelado").length },
    { label: "Entradas no diário", value: entries.length },
  ];

  return (
    // Ocupa a tela toda (o -mb anula o espaço reservado do layout) para o jardim servir de fundo.
    <div className="relative -mb-28 h-screen overflow-hidden bg-gradient-to-b from-sun-50 via-brand-50 to-brand-100 md:-mb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[8%] size-72 rounded-full bg-sun-300/50 blur-3xl"
      />

      <header className="absolute inset-x-0 top-0 z-[1] flex flex-col gap-2 p-4 md:p-8">
        <h1 className="text-2xl font-bold text-ink">Olá, {mockUser.name}</h1>
        <p className="flex w-fit items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur">
          <Droplets className="size-3.5 text-brand-600" aria-hidden />
          <span>
            <CountUp value={garden.total} /> {garden.total === 1 ? "gota" : "gotas"} no jardim
            {garden.toNext !== null && ` · faltam ${garden.toNext} para uma nova planta`}
          </span>
        </p>
      </header>

      {/* No celular a barra de navegação cobre os 5rem de baixo; a gaveta e o jardim ficam acima dela. */}
      <div className="absolute inset-x-0 top-0 bottom-20 md:bottom-0">
        <div
          className={cn(
            "absolute inset-0 transition-[padding] duration-300",
            snap === "peek" ? "pb-[84px]" : "pb-[50%]",
          )}
        >
          <GardenScene plants={garden.plants} />
        </div>

        <ActionSheet snap={snap} onSnapChange={setSnap} title="Seu painel de hoje">
          <Stagger className="space-y-8 pt-2">
            <CheckIn mood={garden.todayCheckIn?.mood} onSelect={garden.checkIn} />

            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex h-11 items-center justify-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-brand-600 hover:text-brand-700 focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none"
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <WeekStrip days={garden.week} streak={garden.streak} />

            <dl className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse rounded-2xl bg-sunken p-4">
                  <dd className="text-3xl font-bold text-primary">
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
              <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
            </Link>
          </Stagger>
        </ActionSheet>
      </div>
    </div>
  );
}
