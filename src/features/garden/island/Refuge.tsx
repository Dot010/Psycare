"use client";

import { ArrowLeft, CircleHelp, Droplets, Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CountUp } from "@/components/motion/CountUp";
import { CrisisButton } from "@/components/feedback/CrisisButton";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GardenFallback } from "@/features/garden/components/GardenFallback";
import { WaterHelp } from "@/features/garden/components/WaterHelp";
import { WeekStrip } from "@/features/garden/components/WeekStrip";
import type { useGarden } from "@/features/garden/hooks/useGarden";
import { grantWater } from "@/features/garden/water";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { DIARY_KEY } from "@/features/diary/hooks/useDiary";
import type { DiaryEntry } from "@/features/diary/types";
import { useMessages } from "@/features/messages/hooks/useMessages";
import { toISODate } from "@/lib/dates";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";
import { tripSeconds, tripStatus } from "@/features/garden/island/boatTrip";
import { IslandPanel } from "@/features/garden/island/IslandPanel";
import {
  ArrivalCheckIn,
  CabinWrite,
  GRATITUDE_PROMPT,
  Grounding,
  Tour,
  TOUR_KEY,
  WorryStone,
} from "@/features/garden/island/IslandActivities";
import {
  foxRef,
  nextUnlock,
  placeById,
  PLACES,
  SEASON_NAMES,
  seasonFor,
  type PlaceId,
} from "@/features/garden/island/places";
import { placeNews, placesWithNews } from "@/features/garden/island/news";
import { QUESTIONS_KEY } from "@/features/appointments/components/SessionPrep";
import { MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { useSafetyPlan } from "@/features/safety/hooks/useSafetyPlan";
import { useIsland } from "@/features/garden/island/useIsland";
import { useIslandSound } from "@/features/garden/island/useIslandSound";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const IslandCanvas = dynamic(() => import("@/features/garden/island/IslandCanvas"), {
  ssr: false,
  loading: () => <GardenFallback />,
});

type Garden = ReturnType<typeof useGarden>;

/** De onde vêm as gotas. Cada item leva à página onde se ganha, para o refúgio ligar o app inteiro. */
export const WAYS = [
  { text: "Registrar o humor", href: "/dashboard/home" },
  { text: "Concluir uma tarefa do dia", href: "/dashboard/planner" },
  { text: "Fazer uma atividade", href: "/dashboard/activities" },
  { text: "Marcar uma dose tomada", href: "/dashboard/health" },
  { text: "Escrever no diário", href: "/dashboard/diary" },
  { text: "Respirar um minuto", href: "/dashboard/breathing" },
];

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

const noSubscribe = () => () => {};
const NO_QUESTIONS: string[] = [];

/** O passeio da primeira visita: os lugares das atividades, e um último passo com o resto. */
const TOUR: (PlaceId | null)[] = ["canteiros", "cabana", "praia", "farol", "cais", null];
const TOUR_TEXT: Record<string, string> = {
  canteiros: "Cada cuidado do dia vira uma gota. Aqui você rega, e as plantas crescem. Elas nunca murcham.",
  cabana: "O seu diário. Dá para escrever uma linha aqui mesmo, ou uma coisa boa do dia.",
  praia: "Escreva numa pedra o que está pesando. Jogue no mar, ou guarde para conversar na sessão.",
  farol: "Para quando a ansiedade apertar: um exercício curto, o plano de segurança e o CVV.",
  cais: "Um passeio de barco respirando junto com a raposa.",
};
const TOUR_LAST =
  "Garrafa, Correio e Consulta levam às atividades, às mensagens e às consultas. Quando algum tiver novidade, ele brilha.";
const pill =
  "flex min-h-11 items-center gap-2 rounded-full border border-white/60 bg-card/85 px-4 text-sm font-medium text-ink shadow-sm backdrop-blur-md focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

/**
 * O Refúgio: a ilha em tela cheia (cobre o menu), com uma entrada de cinema.
 * Por cima da ilha fica só o essencial: sair, as gotas, o botão de ajuda e os lugares.
 * Cada lugar leva a uma página real do app; as gotas e plantas são as do jardim.
 */
export function Refuge({ garden }: { garden: Garden }) {
  const reduced = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const night = useTheme() === "dark";
  const webgl = useSyncExternalStore(noSubscribe, hasWebGL, () => true);
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
  const season = useMemo(() => seasonFor(new Date()), []);

  const careDays = garden.week.filter((day) => day.count > 0).length;
  const grownPlants = garden.plants.filter((plant) => plant.growth >= 1).length;
  const island = useIsland({ careDays, grownPlants });

  const [selected, setSelected] = useState<PlaceId | null>(null);
  const [naming, setNaming] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [joy, setJoy] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  // Chuvinha de vez em quando (nem sempre): a primeira chance vem logo, as outras demoram mais.
  const [raining, setRaining] = useState(false);
  useEffect(() => {
    if (reduced) return;
    let timer = 0;
    const schedule = (wait: number) => {
      timer = window.setTimeout(() => {
        if (Math.random() < 0.45) {
          setRaining(true);
          timer = window.setTimeout(
            () => {
              setRaining(false);
              schedule(240_000 + Math.random() * 300_000);
            },
            35_000 + Math.random() * 20_000,
          );
        } else schedule(180_000 + Math.random() * 240_000);
      }, wait);
    };
    schedule(40_000 + Math.random() * 50_000);
    return () => window.clearTimeout(timer);
  }, [reduced]);
  const sound = useIslandSound({ night, raining });

  // Travessia de barco respirando: o relógio fica aqui, a cena só acompanha.
  const [trip, setTrip] = useState<{ startedAt: number; cycles: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [arrived, setArrived] = useState(false);
  const addTrip = useRef(island.addTrip);
  useEffect(() => {
    addTrip.current = island.addTrip;
  });
  useEffect(() => {
    if (!trip || arrived) return;
    const id = window.setInterval(() => {
      const seconds = (performance.now() - trip.startedAt) / 1000;
      setElapsed(seconds);
      if (seconds >= tripSeconds(trip.cycles)) {
        window.clearInterval(id);
        setArrived(true);
        // Respirar é um cuidado: rende a gota do dia (uma vez por dia, como na página de respiração).
        grantWater("breathing");
        addTrip.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [trip, arrived]);
  const startTrip = (cycles: number) => {
    setSelected(null);
    setArrived(false);
    setElapsed(0);
    setTrip({ startedAt: performance.now(), cycles });
  };
  const endTrip = () => {
    setTrip(null);
    setArrived(false);
  };
  const breath = trip && !arrived ? tripStatus(elapsed, trip.cycles) : null;

  // Intro: o nome aparece enquanto a câmera desce; some sozinho ou com um toque.
  const [sceneReady, setSceneReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [titleGone, setTitleGone] = useState(false);
  const ready = sceneReady || !webgl;
  useEffect(() => {
    if (introDone) return;
    // Espera a cena aparecer (até 12 s num celular lento) e deixa o nome um pouco na tela.
    const timer = window.setTimeout(() => setIntroDone(true), ready ? (reduced ? 900 : 2200) : 12000);
    return () => window.clearTimeout(timer);
  }, [ready, reduced, introDone]);

  // Tela cheia de verdade: a página de trás não rola.
  useEffect(() => {
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, []);

  // Ela pula de alegria quando a água cai no canteiro.
  const lastPoured = useRef(garden.poured);
  useEffect(() => {
    if (garden.poured > lastPoured.current) setJoy((value) => value + 1);
    lastPoured.current = garden.poured;
  }, [garden.poured]);

  const pet = () => {
    sound.pet();
    setNote(`${island.foxName ? `A ${island.foxName}` : "A raposa"} gostou do carinho.`);
    window.setTimeout(() => setNote(null), 2500);
  };

  const saveName = (form: HTMLFormElement) => {
    const value = new FormData(form).get("foxName");
    const ok = island.rename(typeof value === "string" ? value : "");
    setNameError(!ok);
    if (ok) setNaming(false);
  };

  // O que há de novo em cada lugar vem das telas de verdade (atividades, mensagens, consultas, diário).
  const { assignments } = useActivities();
  const { chats } = useMessages();
  const { appointments } = useAppointments();
  const [diary, setDiary] = useLocalStorage<DiaryEntry[]>(DIARY_KEY, mockUser.diaryEntries);
  const [, setQuestions] = useLocalStorage<string[]>(QUESTIONS_KEY, NO_QUESTIONS);
  const safety = useSafetyPlan();
  const nowStamp = `${toISODate(new Date())}T${new Date().toTimeString().slice(0, 5)}`;
  const highlights = placesWithNews({ assignments, chats, appointments, now: nowStamp });
  const lanterns = diary.filter((entry) => entry.prompt === GRATITUDE_PROMPT).length;
  const [throwId, setThrowId] = useState(0);

  // Cabana: a linha vira uma página de verdade no Diário (e rende a gota do diário, uma vez por dia).
  const writeLine = (text: string, gratitude: boolean) => {
    const level = garden.todayCheckIn?.level ?? 3;
    setDiary((current) => [
      {
        id: crypto.randomUUID(),
        date: toISODate(new Date()),
        mood: MOOD_LABELS[level as MoodLevel],
        moodLevel: level as MoodLevel,
        title: gratitude ? GRATITUDE_PROMPT : text.split(/\s+/).slice(0, 6).join(" "),
        content: text,
        kind: "text",
        ...(gratitude ? { prompt: GRATITUDE_PROMPT } : {}),
      },
      ...current,
    ]);
    grantWater("diary");
  };
  // Praia: guardar a preocupação leva a frase para "Preparar a sessão".
  const keepWorry = (text: string) =>
    setQuestions((current) => (current.includes(text) ? current : [...current, text]));

  // Primeira visita: a raposa mostra os lugares. Depois, pergunta como você está (uma vez por dia).
  const [tourDone, setTourDone] = useLocalStorage<boolean>(TOUR_KEY, false);
  const [tourStep, setTourStep] = useState(0);
  const touring = introDone && !tourDone && !trip;
  const tourPlace = touring ? TOUR[tourStep] : null;
  const [arrivalDismissed, setArrivalDismissed] = useState(false);
  const asking = introDone && tourDone && !trip && !garden.todayCheckIn && !arrivalDismissed && !selected;
  const news = selected
    ? placeNews(selected, { assignments, chats, appointments, diaryPages: diary.length, now: nowStamp })
    : null;
  const fox = foxRef(island.foxName);
  const growth = nextUnlock({ careDays, grownPlants, trips: island.trips });
  const activity =
    selected === "cabana" ? (
      <CabinWrite onSave={writeLine} />
    ) : selected === "praia" ? (
      <WorryStone onThrow={() => setThrowId((n) => n + 1)} onKeep={keepWorry} />
    ) : selected === "farol" ? (
      <Grounding fox={fox} onHelped={() => safety.addTo("coping", `5-4-3-2-1 com ${fox}`)} />
    ) : null;

  const panel = selected ? (
    <IslandPanel
      place={selected}
      foxName={island.foxName}
      plants={garden.plants}
      available={garden.available}
      toNext={garden.toNext}
      pouring={garden.pouring}
      onPour={garden.pour}
      onStartTrip={startTrip}
      news={news}
      onClose={() => setSelected(null)}
    >
      {activity}
    </IslandPanel>
  ) : null;

  const hud = cn(
    "transition-opacity duration-700",
    introDone ? "opacity-100" : "pointer-events-none opacity-0",
  );

  if (!mounted) return null;

  return createPortal(
    <section
      aria-label="Seu refúgio"
      className="fixed inset-0 z-50 overflow-hidden bg-[#bfe0e6] text-ink dark:bg-[#16202e]"
    >
      <div className="absolute inset-0" aria-hidden>
        {webgl ? (
          <IslandCanvas
            plants={garden.plants}
            selected={touring ? (tourPlace ?? null) : selected}
            unlocked={island.unlocked}
            season={season}
            night={night}
            animate={!reduced}
            quality={compact ? "low" : "high"}
            joy={joy}
            intro={!skipped}
            raining={raining}
            trip={trip}
            throwId={throwId}
            lanterns={lanterns}
            highlights={highlights}
            onReady={() => setSceneReady(true)}
            onSelect={setSelected}
            onGround={() => setSelected(null)}
            onPet={pet}
          />
        ) : (
          <GardenFallback />
        )}
      </div>
      {/* Borda levemente arroxeada, como no portfólio do Bruno Simon. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(70,24,84,0.28)_100%)]"
      />

      {/* Intro: o nome do lugar, grande, enquanto a câmera desce. */}
      {!titleGone && (
        <button
          type="button"
          aria-hidden={introDone}
          tabIndex={introDone ? -1 : 0}
          onClick={() => {
            setIntroDone(true);
            setSkipped(true);
          }}
          onTransitionEnd={() => introDone && setTitleGone(true)}
          className={cn(
            "absolute inset-0 flex cursor-default flex-col items-center justify-center gap-3 bg-gradient-to-b from-strong/45 via-transparent to-transparent px-6 text-center text-white transition-opacity duration-700 focus-visible:outline-none",
            introDone && "pointer-events-none opacity-0",
          )}
        >
          <span className="animate-page-in text-sm font-semibold tracking-[0.3em] uppercase opacity-90 [text-shadow:0_1px_8px_rgb(0_0_0/0.35)]">
            PsyCare
          </span>
          <span className="animate-page-in text-5xl font-semibold tracking-tight [text-shadow:0_2px_18px_rgb(0_0_0/0.35)] md:text-7xl">
            Seu refúgio
          </span>
          <span className="animate-page-in max-w-sm text-base [text-shadow:0_1px_10px_rgb(0_0_0/0.4)]">
            Um lugar só seu, no seu tempo.
          </span>
          <span className="absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-md">
            Pular
          </span>
        </button>
      )}

      {/* Topo: sair, nome, gotas e ajuda. */}
      <header
        className={cn(
          "absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-5",
          hud,
        )}
      >
        <div className="flex items-center gap-2">
          <Link href="/dashboard/home" aria-label="Sair do refúgio" className={cn(pill, "px-3")}>
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          {/* No celular o nome fica só na intro: o topo precisa de espaço para gotas, som e ajuda. */}
          <h1 className={cn(pill, "font-semibold whitespace-nowrap max-sm:sr-only")}>Seu refúgio</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className={cn(pill, "border-sun-300 bg-sun-300/95 font-semibold")}>
                <Droplets className="size-4" aria-hidden />
                <CountUp value={garden.available} /> {garden.available === 1 ? "gota" : "gotas"}
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[92dvh] gap-4 overflow-y-auto rounded-2xl p-6 sm:max-w-md">
              <DialogTitle className="text-xl font-bold text-foreground">Suas gotas</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {garden.available > 0
                  ? "Cada uma rega os canteiros uma vez."
                  : "Ganhe gotas cuidando de você."}{" "}
                Já são {garden.poured} {garden.poured === 1 ? "gota" : "gotas"} nos canteiros.
                {garden.toNext !== null &&
                  ` Faltam ${garden.toNext} ${garden.toNext === 1 ? "gota" : "gotas"} para uma planta nova.`}
              </DialogDescription>
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
              <WeekStrip days={garden.week} streak={garden.streak} />
              <WaterHelp poured={garden.poured} toNext={garden.toNext}>
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-2 self-start text-sm font-medium text-brand-ink underline underline-offset-2"
                >
                  <CircleHelp className="size-4" aria-hidden />
                  Como os canteiros crescem
                </button>
              </WaterHelp>
              <p className="text-xs text-muted-foreground">Dia sem gota é só um dia sem gota.</p>
            </DialogContent>
          </Dialog>
          <button
            type="button"
            aria-pressed={sound.enabled}
            aria-label={sound.enabled ? "Desligar o som" : "Ligar o som"}
            onClick={sound.toggle}
            className={cn(pill, "px-3")}
          >
            {sound.enabled ? (
              <Volume2 className="size-5" aria-hidden />
            ) : (
              <VolumeX className="size-5" aria-hidden />
            )}
          </button>
          <CrisisButton placement="inline" />
        </div>
      </header>

      {/* Só um aviso curto, no meio, que some sozinho. */}
      {note && (
        <p role="status" className="pointer-events-none absolute inset-x-0 top-20 text-center">
          <span className="rounded-full bg-strong/90 px-3 py-1.5 text-xs font-semibold text-white">
            {note}
          </span>
        </p>
      )}

      {naming && (
        <form
          className="absolute inset-x-3 top-20 mx-auto max-w-sm rounded-3xl border border-border bg-card p-4 shadow-lg"
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

      {/* O cartão do lugar: ao lado nas telas largas, embaixo (rolando) no celular. */}
      {/* Primeira visita: um lugar de cada vez, com a câmera indo até ele. */}
      {touring && tourPlace !== undefined && (
        <div className="absolute inset-x-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] mx-auto max-w-sm md:right-5 md:bottom-auto md:left-auto md:top-24 md:w-80">
          <Tour
            step={tourStep}
            total={TOUR.length}
            label={tourPlace ? placeById(tourPlace).label : "E mais três lugares"}
            text={tourPlace ? TOUR_TEXT[tourPlace] : TOUR_LAST}
            onNext={() => {
              if (tourStep >= TOUR.length - 1) setTourDone(true);
              else setTourStep(tourStep + 1);
            }}
            onSkip={() => setTourDone(true)}
          />
        </div>
      )}

      {/* Chegada: a raposa pergunta como você está (o mesmo registro do Início). */}
      {asking && (
        <div className="absolute inset-x-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] mx-auto max-w-md">
          <ArrivalCheckIn
            fox={fox}
            onPick={(level) => {
              garden.checkIn(level);
              setJoy((value) => value + 1);
              setNote("Registrado. Valeu uma gota.");
              window.setTimeout(() => setNote(null), 2500);
            }}
            onSkip={() => setArrivalDismissed(true)}
          />
        </div>
      )}

      {panel && !trip && !touring && (
        <div
          className={cn(
            "absolute inset-x-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] max-h-[44dvh] overflow-y-auto rounded-3xl md:inset-x-auto md:top-24 md:right-5 md:bottom-auto md:max-h-[calc(100dvh-14rem)] md:w-80",
            hud,
          )}
        >
          {panel}
        </div>
      )}

      {/* No barco: o guia da respiração embaixo, no meio. */}
      {trip && (
        <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] mx-auto max-w-sm rounded-3xl border border-white/60 bg-card/90 p-5 text-center shadow-lg backdrop-blur-md">
          {arrived ? (
            <>
              <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Você chegou
              </p>
              <h2 className="mt-1 text-2xl font-semibold">A ilhota</h2>
              <p className="mt-2 text-sm">
                {trip.cycles} respirações até aqui, com {foxRef(island.foxName)}. Respirar conta como cuidado:
                rende a gota do dia.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Se ficou tonto(a), respire normal por um tempo. Não precisa fazer de novo agora.
              </p>
              <button
                type="button"
                onClick={endTrip}
                className="mt-4 min-h-11 w-full rounded-full bg-strong px-5 text-sm font-medium text-white focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
              >
                Voltar para casa
              </button>
            </>
          ) : (
            <>
              <p aria-live="polite" className="text-3xl font-semibold">
                {breath?.kind === "exhale" ? "Solte devagar" : (breath?.label ?? "Inspire")}
              </p>
              <p className="mt-1 text-5xl leading-none font-semibold tabular-nums" aria-hidden>
                {breath?.remaining ?? ""}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Respiração {Math.min(breath?.cycle ?? 1, trip.cycles)} de {trip.cycles}
              </p>
              <div
                role="progressbar"
                aria-label="Caminho até a ilhota"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((elapsed / tripSeconds(trip.cycles)) * 100)}
                className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100"
              >
                <div
                  className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
                  style={{ width: `${Math.min(100, (elapsed / tripSeconds(trip.cycles)) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                onClick={endTrip}
                className="mt-4 min-h-11 rounded-full border border-border px-5 text-sm focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
              >
                Parar e voltar
              </button>
            </>
          )}
        </div>
      )}

      {/* Embaixo: os lugares e uma linha sobre a ilha. */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 space-y-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-5",
          hud,
          trip && "hidden",
        )}
      >
        <nav
          aria-label="Lugares da ilha"
          className="flex gap-2 overflow-x-auto [scrollbar-width:none] md:flex-wrap md:justify-center md:overflow-visible"
        >
          {PLACES.map((place) => (
            <button
              key={place.id}
              type="button"
              aria-pressed={selected === place.id}
              onClick={() => setSelected(place.id)}
              className={cn(pill, "shrink-0 aria-pressed:border-brand-600 aria-pressed:bg-brand-50")}
            >
              {place.label}
            </button>
          ))}
        </nav>
        <p className="flex flex-wrap items-center justify-center gap-x-2 text-center text-xs font-medium text-ink [text-shadow:0_1px_6px_rgb(255_255_255/0.8)] dark:text-white dark:[text-shadow:0_1px_6px_rgb(0_0_0/0.6)]">
          <span>
            {SEASON_NAMES[season]} na ilha · {foxRef(island.foxName)} vai junto. Arraste para os lados para
            girar.
          </span>
          <button
            type="button"
            onClick={() => setNaming(true)}
            className="min-h-9 underline underline-offset-2"
          >
            {island.foxName ? `Mudar o nome da ${island.foxName}` : "Dar um nome à raposa"}
          </button>
        </p>
        {/* O que vai aparecer na ilha em seguida: um motivo gentil para voltar, sem prazo. */}
        {growth && (
          <p className="text-center text-xs text-ink [text-shadow:0_1px_6px_rgb(255_255_255/0.8)] dark:text-white dark:[text-shadow:0_1px_6px_rgb(0_0_0/0.6)]">
            {growth}
          </p>
        )}
      </div>
    </section>,
    document.body,
  );
}
