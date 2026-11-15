"use client";

import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { CountUp } from "@/components/motion/CountUp";
import { Block } from "@/components/ui/block";
import { GardenCard } from "@/features/garden/components/GardenCard";
import { WaterHelp } from "@/features/garden/components/WaterHelp";
import { WeekStrip } from "@/features/garden/components/WeekStrip";
import { useGarden } from "@/features/garden/hooks/useGarden";

/** De onde vêm as gotas. Cada item leva à página onde se ganha, para o jardim ligar o app inteiro. */
const WAYS = [
  { text: "Registrar o humor", href: "/dashboard/home" },
  { text: "Concluir uma tarefa do dia", href: "/dashboard/planner" },
  { text: "Fazer uma atividade", href: "/dashboard/activities" },
  { text: "Marcar uma dose tomada", href: "/dashboard/health" },
  { text: "Escrever no diário", href: "/dashboard/diary" },
  { text: "Respirar um minuto", href: "/dashboard/breathing" },
];

/**
 * Página do jardim: a cena 3D grande e, ao lado, as gotas guardadas e de onde elas vêm.
 * Mesma base das outras páginas (título leve, duas colunas, blocos).
 */
export default function GardenView() {
  const garden = useGarden();

  return (
    <Page
      title="Seu jardim"
      kicker="Jardim"
      description="Cresce com o que você faz por você, no seu tempo. Ele nunca murcha."
      width="wide"
      actions={
        <WaterHelp poured={garden.poured} toNext={garden.toNext}>
          <button
            type="button"
            className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
          >
            <CircleHelp className="size-4" aria-hidden />
            Como o jardim cresce
          </button>
        </WaterHelp>
      }
    >
      <PageColumns
        aside={
          <>
            <Block tone="sun" title="Gotas guardadas">
              <p className="text-5xl leading-none font-semibold tracking-tight">
                <CountUp value={garden.available} />
              </p>
              <p className="mt-3 text-sm">
                {garden.available > 0 ? "Cada uma rega o jardim uma vez." : "Ganhe gotas cuidando de você."}{" "}
                Já são <CountUp value={garden.poured} /> {garden.poured === 1 ? "gota" : "gotas"} no jardim.
              </p>
              {garden.toNext !== null && (
                <p className="mt-1 text-sm font-medium">
                  Faltam {garden.toNext} {garden.toNext === 1 ? "gota" : "gotas"} para uma planta nova.
                </p>
              )}
            </Block>

            <Block title="Como ganhar gotas">
              <ul>
                {WAYS.map((way) => (
                  <li key={way.href + way.text} className="border-t border-sunken first:border-t-0">
                    <Link
                      href={way.href}
                      className="flex min-h-12 items-center justify-between gap-3 text-sm hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                    >
                      {way.text}
                      <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-ink">
                        +1
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">Dia sem gota é só um dia sem gota.</p>
            </Block>
          </>
        }
      >
        <GardenCard garden={garden} />
        <Block>
          <WeekStrip days={garden.week} streak={garden.streak} />
        </Block>
      </PageColumns>
    </Page>
  );
}
