"use client";

import { Droplets, Phone, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLANT_NAMES, PLANT_ORDER } from "@/features/garden/logic";
import { TRIP_CYCLES, tripSeconds } from "@/features/garden/island/boatTrip";
import { foxRef, placeById, type PlaceId } from "@/features/garden/island/places";
import type { PlantState } from "@/features/garden/types";

export interface IslandPanelProps {
  place: PlaceId;
  foxName: string;
  plants: PlantState[];
  available: number;
  /** Gotas que faltam para a próxima planta nascer (null: já nasceram todas). */
  toNext?: number | null;
  pouring: boolean;
  onPour: () => void;
  /** Uma linha viva do lugar (ex.: "2 atividades esperando você"), vinda das outras telas do app. */
  news?: string | null;
  /** No cais: sair de barco respirando (quantas respirações). */
  onStartTrip?: (cycles: number) => void;
  onClose: () => void;
  /** A atividade do lugar (escrever na Cabana, a pedra na Praia, o 5-4-3-2-1 no Farol). */
  children?: React.ReactNode;
}

/** O que o botão de cada lugar faz, em palavras (leva à página de verdade no app). */
const ACTION: Record<PlaceId, string> = {
  canteiros: "",
  cabana: "Abrir o diário",
  farol: "Abrir meu plano de segurança",
  cais: "",
  garrafa: "Ver as atividades",
  correio: "Ver as mensagens",
  consulta: "Ver as consultas",
  praia: "Ver o que vai para a sessão",
};

const linkClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-strong px-5 text-sm font-medium text-white focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

/** O cartão do lugar: o que ele é e o caminho para a página de verdade no app. */
export function IslandPanel({
  place,
  foxName,
  plants,
  available,
  toNext = null,
  pouring,
  onPour,
  onStartTrip,
  news = null,
  onClose,
  children,
}: IslandPanelProps) {
  const p = placeById(place);
  const fox = foxRef(foxName);

  return (
    <section
      aria-labelledby="island-place"
      className="rounded-3xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="island-place" className="text-base font-medium">
            {p.label}
          </h2>
          <p className="text-sm text-muted-foreground">{p.hint}</p>
          {news && <p className="mt-1 text-sm font-medium text-brand-ink">{news}</p>}
        </div>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-sunken focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {children}

      {place === "canteiros" && (
        <div className="mt-3">
          {/* Um canteiro por planta, na ordem em que nascem. */}
          <ol className="grid grid-cols-2 gap-2" aria-label="Plantas">
            {PLANT_ORDER.map((kind, k) => {
              const plant = plants.find((item) => item.kind === kind);
              const next = !plant && k === plants.length;
              return (
                <li
                  key={kind}
                  className={
                    plant
                      ? "rounded-2xl bg-brand-100 px-3 py-2 text-xs font-medium text-brand-ink"
                      : "rounded-2xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground"
                  }
                >
                  {plant ? (
                    <>
                      <span>
                        {PLANT_NAMES[kind]} · {Math.round(plant.growth * 100)}%
                      </span>
                      <span
                        aria-hidden
                        className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/70"
                      >
                        <span
                          className="block h-full rounded-full bg-brand-600"
                          style={{ width: `${Math.round(plant.growth * 100)}%` }}
                        />
                      </span>
                    </>
                  ) : next && toNext !== null ? (
                    `${PLANT_NAMES[kind]} nasce em ${toNext} ${toNext === 1 ? "gota" : "gotas"}`
                  ) : (
                    "Canteiro esperando"
                  )}
                </li>
              );
            })}
          </ol>
          <Button onClick={onPour} disabled={available === 0 || pouring} className="mt-4 w-full">
            <Droplets aria-hidden />
            {pouring ? "Regando..." : available > 0 ? `Regar (${available})` : "Sem gotas para regar"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            As gotas vêm dos seus cuidados: check-in, hábitos, diário e respiração.
          </p>
        </div>
      )}

      {place === "farol" && (
        <div className="mt-3 rounded-2xl border border-danger-300 bg-danger-50 p-4 text-sm">
          <a href="tel:188" className="flex min-h-11 items-center gap-2 font-semibold">
            <Phone className="size-4" aria-hidden /> CVV · 188 (gratuito, 24 horas)
          </a>
          <a href="tel:192" className="flex min-h-11 items-center gap-2 font-semibold">
            <Phone className="size-4" aria-hidden /> SAMU · 192
          </a>
          <p className="text-xs text-muted-foreground">
            O botão de ajuda do app fica sempre visível, fora da ilha.
          </p>
        </div>
      )}

      {place === "cais" && onStartTrip && (
        <div className="mt-3">
          <p className="text-sm">
            Atravesse até a ilhota com {fox}: inspire enchendo a vela, solte o ar e o barco anda.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TRIP_CYCLES.map((cycles) => (
              <button
                key={cycles}
                type="button"
                aria-label={`${cycles} respirações, ${tripSeconds(cycles)} segundos`}
                onClick={() => onStartTrip(cycles)}
                className="flex min-h-16 flex-col items-center justify-center rounded-2xl bg-strong px-2 text-white focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
              >
                <span className="text-xl leading-none font-semibold">{cycles}</span>
                <span className="mt-1 text-xs opacity-85">respirações</span>
                <span className="text-xs opacity-70">{tripSeconds(cycles)} s</span>
              </button>
            ))}
          </div>
          <Link
            href={p.href}
            className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-brand-ink underline underline-offset-2"
          >
            Mais exercícios de respiração
          </Link>
        </div>
      )}

      {place !== "canteiros" && !(place === "cais" && onStartTrip) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={p.href} className={linkClass}>
            {place === "cais" ? `Respirar com ${fox}` : ACTION[place]}
          </Link>
        </div>
      )}
    </section>
  );
}
