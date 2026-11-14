"use client";

import { Droplets, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { GardenScene } from "@/features/garden/components/GardenScene";
import { IntroHint } from "@/features/garden/components/IntroHint";
import { useGarden } from "@/features/garden/hooks/useGarden";
import { useGardenSound } from "@/features/garden/hooks/useGardenSound";
import { PLANT_NAMES } from "@/features/garden/logic";
import type { PlantKind } from "@/features/garden/types";

type Garden = ReturnType<typeof useGarden>;

/** O jardim 3D num cartão, com o regador e o som. O selo de gotas fica no topo da página. */
export function GardenCard({ garden }: { garden: Garden }) {
  const sound = useGardenSound();
  const [selected, setSelected] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectPlant = (kind: PlantKind) => {
    const plant = garden.plants.find((item) => item.kind === kind);
    if (!plant) return;
    setSelected(`${PLANT_NAMES[kind]} · ${Math.round(plant.growth * 100)}% crescido`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSelected(null), 3500);
  };

  return (
    <section aria-label="Cena do jardim" className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative h-[58dvh] min-h-80 bg-gradient-to-b from-sun-50 via-brand-50 to-brand-100">
        <GardenScene plants={garden.plants} lift={0} onSelect={selectPlant} />
        <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-col items-center gap-2">
          {selected && (
            <p role="status" className="rounded-full bg-strong px-3 py-1.5 text-xs font-semibold text-white">
              {selected}
            </p>
          )}
          <IntroHint />
        </div>
      </div>

      <div className="flex items-center gap-2 p-4">
        <Button onClick={garden.pour} disabled={garden.available === 0 || garden.pouring} className="flex-1">
          <Droplets aria-hidden />
          {garden.pouring
            ? "Regando..."
            : garden.available > 0
              ? `Regar (${garden.available})`
              : "Sem gotas para regar"}
        </Button>
        <button
          type="button"
          role="switch"
          aria-checked={sound.enabled}
          aria-label="Som do jardim"
          onClick={sound.toggle}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sunken text-foreground pointer-coarse:size-11 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
        >
          {sound.enabled ? (
            <Volume2 className="size-5" aria-hidden />
          ) : (
            <VolumeX className="size-5" aria-hidden />
          )}
        </button>
      </div>
    </section>
  );
}
