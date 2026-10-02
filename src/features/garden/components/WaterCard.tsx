"use client";

import { Check, Droplets } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CARE_ACTIONS } from "@/features/garden/logic";
import type { WaterSource } from "@/features/garden/types";
import { cn } from "@/lib/utils";

interface WaterCardProps {
  available: number;
  pouring: boolean;
  doneToday: Set<WaterSource>;
  toNext: number | null;
  onPour: () => void;
}

/** O regador: mostra quantas gotas estão prontas, quais ações já encheram hoje, e o botão de regar. */
export function WaterCard({ available, pouring, doneToday, toNext, onPour }: WaterCardProps) {
  const doneCount = CARE_ACTIONS.filter((action) => doneToday.has(action.source)).length;

  return (
    <section aria-labelledby="water-title" className="space-y-4 rounded-2xl bg-brand-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="water-title" className="text-base font-bold text-foreground">
            Seu regador
          </h2>
          <p className="text-xs text-muted-foreground">
            {available > 0
              ? `${available} ${available === 1 ? "gota pronta" : "gotas prontas"} para regar`
              : "Vazio. Cuide de você para encher."}
          </p>
        </div>
        <Button onClick={onPour} disabled={available === 0 || pouring} className="shrink-0">
          <Droplets aria-hidden />
          {pouring ? "Regando..." : "Regar"}
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Hoje: {doneCount} de {CARE_ACTIONS.length} ações
          {toNext !== null ? ` · faltam ${toNext} gotas para uma nova planta` : ""}
        </p>
        <ul className="flex flex-wrap gap-2">
          {CARE_ACTIONS.map(({ source, label, href }) => {
            const done = doneToday.has(source);
            const className = cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
              done ? "border-brand-600 bg-brand-600 text-white" : "border-input bg-card text-foreground",
            );
            return (
              <li key={source}>
                {!done && href ? (
                  <Link href={href} className={cn(className, "transition-colors hover:border-brand-600")}>
                    {label} · +1
                  </Link>
                ) : (
                  <span className={className}>
                    {done && <Check className="size-3.5" aria-hidden />}
                    {label}
                    <span className="sr-only">{done ? ", feito hoje" : ", ainda não feito hoje"}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
