"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { GardenFallback } from "@/features/garden/components/GardenFallback";
import type { useGarden } from "@/features/garden/hooks/useGarden";
import { IslandPanel } from "@/features/garden/island/IslandPanel";
import { foxRef, PLACES, SEASON_NAMES, seasonFor, type PlaceId } from "@/features/garden/island/places";
import { useIsland } from "@/features/garden/island/useIsland";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const IslandCanvas = dynamic(() => import("@/features/garden/island/IslandCanvas"), {
  ssr: false,
  loading: () => <GardenFallback />,
});

type Garden = ReturnType<typeof useGarden>;

let webglSupport: boolean | undefined;
function hasWebGL(): boolean {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/**
 * A ilha: a cena 3D com a raposa, a lista de lugares (para quem não usa o 3D) e o cartão do lugar.
 * Cada lugar leva a uma página real do app; as gotas e plantas são as do jardim.
 */
export function IslandCard({ garden }: { garden: Garden }) {
  const reduced = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const night = useTheme() === "dark";
  const webgl = useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => true,
  );
  const season = useMemo(() => seasonFor(new Date()), []);

  const careDays = garden.week.filter((day) => day.count > 0).length;
  const grownPlants = garden.plants.filter((plant) => plant.growth >= 1).length;
  const island = useIsland({ careDays, grownPlants });
  const unlocked = island.unlocked;

  const [selected, setSelected] = useState<PlaceId | null>(null);
  const [naming, setNaming] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [joy, setJoy] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  // Ela pula de alegria quando a água cai no canteiro.
  const lastPoured = useRef(garden.poured);
  useEffect(() => {
    if (garden.poured > lastPoured.current) setJoy((value) => value + 1);
    lastPoured.current = garden.poured;
  }, [garden.poured]);

  const pet = () => {
    setNote(`${island.foxName ? `A ${island.foxName}` : "A raposa"} gostou do carinho.`);
    window.setTimeout(() => setNote(null), 2500);
  };

  const saveName = (form: HTMLFormElement) => {
    const value = new FormData(form).get("foxName");
    const ok = island.rename(typeof value === "string" ? value : "");
    setNameError(!ok);
    if (ok) setNaming(false);
  };

  const panel = selected ? (
    <IslandPanel
      place={selected}
      foxName={island.foxName}
      plants={garden.plants}
      available={garden.available}
      pouring={garden.pouring}
      onPour={garden.pour}
      onClose={() => setSelected(null)}
    />
  ) : null;

  return (
    <section aria-label="Ilha do jardim" className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative h-[46dvh] min-h-72 bg-gradient-to-b from-sun-50 via-brand-50 to-brand-100 md:h-[64dvh] md:min-h-96">
        <div className="absolute inset-0" aria-hidden>
          {webgl ? (
            <IslandCanvas
              plants={garden.plants}
              selected={selected}
              unlocked={unlocked}
              season={season}
              night={night}
              animate={!reduced}
              quality={compact ? "low" : "high"}
              joy={joy}
              onSelect={setSelected}
              onGround={() => setSelected(null)}
              onPet={pet}
            />
          ) : (
            <GardenFallback />
          )}
        </div>
        {/* Borda levemente arroxeada, como no portfólio do Bruno Simon. */}
        {webgl && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(70,24,84,0.28)_100%)]"
          />
        )}

        {/* Só um aviso curto, embaixo e no meio, que some sozinho: nada fixo em cima da ilha. */}
        {note && (
          <p role="status" className="pointer-events-none absolute inset-x-0 bottom-3 text-center">
            <span className="rounded-full bg-strong/90 px-3 py-1.5 text-xs font-semibold text-white">
              {note}
            </span>
          </p>
        )}

        {naming && (
          <form
            className="absolute inset-x-3 top-3 mx-auto max-w-sm rounded-3xl border border-border bg-card p-4 shadow-lg"
            onSubmit={(event) => {
              event.preventDefault();
              saveName(event.currentTarget);
            }}
          >
            <label htmlFor="fox-name" className="text-sm font-medium">
              Como ela vai se chamar?
            </label>
            <input
              id="fox-name"
              name="foxName"
              maxLength={16}
              autoComplete="off"
              placeholder="Mel"
              defaultValue={island.foxName}
              aria-invalid={nameError}
              aria-describedby={nameError ? "fox-name-error" : undefined}
              className="mt-2 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base"
            />
            {nameError && (
              <p id="fox-name-error" className="mt-1 text-xs text-danger-600">
                Use só letras.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="min-h-11 flex-1 rounded-full bg-strong px-4 text-sm font-medium text-white"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setNaming(false)}
                className="min-h-11 rounded-full border border-border px-4 text-sm"
              >
                Depois
              </button>
            </div>
          </form>
        )}

        {/* Telas largas: o cartão fica ao lado, por cima da cena (a câmera desliza para a esquerda). */}
        {panel && <div className="absolute top-3 right-3 hidden w-80 md:block">{panel}</div>}
      </div>

      {/* Celular: o cartão vai para baixo da ilha, sem cobrir nada. */}
      {panel && <div className="border-b border-border p-3 md:hidden">{panel}</div>}

      <nav
        aria-label="Lugares da ilha"
        className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:p-4"
      >
        {PLACES.map((place) => (
          <button
            key={place.id}
            type="button"
            aria-pressed={selected === place.id}
            onClick={() => setSelected(place.id)}
            className="min-h-11 shrink-0 rounded-full border border-border bg-card px-4 text-sm aria-pressed:border-brand-600 aria-pressed:bg-brand-50 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
          >
            {place.label}
          </button>
        ))}
      </nav>
      <p className="flex flex-wrap items-center gap-x-2 px-4 pb-4 text-xs text-muted-foreground">
        <span>
          {SEASON_NAMES[season]} na ilha · {foxRef(island.foxName)} vai junto. Arraste para os lados para
          girar.
        </span>
        <button
          type="button"
          onClick={() => setNaming(true)}
          className="min-h-9 font-medium text-brand-ink underline underline-offset-2"
        >
          {island.foxName ? `Mudar o nome da ${island.foxName}` : "Dar um nome à raposa"}
        </button>
      </p>
    </section>
  );
}
