"use client";

import { CircleHelp, Droplets } from "lucide-react";
import Link from "next/link";
import { CountUp } from "@/components/motion/CountUp";
import { GardenCard } from "@/features/garden/components/GardenCard";
import { WaterHelp } from "@/features/garden/components/WaterHelp";
import { WeekStrip } from "@/features/garden/components/WeekStrip";
import { useGarden } from "@/features/garden/hooks/useGarden";

/**
 * Página do jardim: a cena 3D grande e, ao lado, os dias de cuidado da semana.
 * Mesmo contêiner e mesmas colunas do Início, para tudo ficar alinhado com a barra do topo.
 */
export default function GardenView() {
  const garden = useGarden();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/home"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Início
          </Link>
          <h1 className="text-4xl leading-tight font-light tracking-tight text-ink md:text-5xl">
            Seu jardim
          </h1>
          <p className="text-sm text-muted-foreground">
            Cada cuidado do dia vira uma gota. Regue e veja as plantas crescerem.
          </p>
        </div>
        <WaterHelp poured={garden.poured} toNext={garden.toNext}>
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-full bg-sun-300 px-4 text-sm font-semibold text-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
          >
            <Droplets className="size-4" aria-hidden />
            <span>
              <CountUp value={garden.poured} /> {garden.poured === 1 ? "gota" : "gotas"} no jardim
            </span>
            <CircleHelp className="size-4" aria-label="Como o jardim cresce" />
          </button>
        </WaterHelp>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <GardenCard garden={garden} />
        <section className="rounded-3xl border border-border bg-card p-6">
          <WeekStrip days={garden.week} streak={garden.streak} />
        </section>
      </div>
    </div>
  );
}
