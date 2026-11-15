"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { MoodFace } from "@/features/mood/components/MoodFace";
import { MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";
import { cn } from "@/lib/utils";

/** A marca das páginas de gratidão no diário: cada uma acende uma lanterna no céu da ilha. */
export const GRATITUDE_PROMPT = "Uma coisa boa de hoje";
export const LINE_MAX = 200;
const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];
const chip =
  "min-h-11 rounded-full border border-border px-4 text-sm font-medium focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

/**
 * Chegada: a raposa pergunta como você está (uma vez por dia).
 * É o mesmo registro de humor do Início, e rende a mesma gota.
 */
export function ArrivalCheckIn({
  fox,
  onPick,
  onSkip,
}: {
  fox: string;
  onPick: (level: MoodLevel) => void;
  onSkip: () => void;
}) {
  return (
    <section
      aria-labelledby="arrival-title"
      className="animate-rise rounded-3xl border border-border bg-card/95 p-5 shadow-lg backdrop-blur"
    >
      <h2 id="arrival-title" className="text-base font-medium">
        {fox.charAt(0).toUpperCase() + fox.slice(1)} quer saber: como você está?
      </h2>
      <p className="text-sm text-muted-foreground">Conta igual ao registro do Início.</p>
      <div role="group" aria-label="Como você está" className="mt-3 flex flex-wrap gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            aria-label={MOOD_LABELS[level]}
            onClick={() => onPick(level)}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm hover:border-brand-600 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
          >
            <MoodFace level={level} size={24} />
            {MOOD_LABELS[level]}
          </button>
        ))}
      </div>
      <button type="button" onClick={onSkip} className="mt-2 min-h-11 text-sm underline underline-offset-2">
        Agora não
      </button>
    </section>
  );
}

/**
 * Cabana: uma linha no diário sem sair da ilha. "Uma coisa boa de hoje" solta uma lanterna à noite.
 */
export function CabinWrite({ onSave }: { onSave: (text: string, gratitude: boolean) => void }) {
  const [text, setText] = useState("");
  const [gratitude, setGratitude] = useState(false);
  const [saved, setSaved] = useState<null | boolean>(null);

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) return;
        onSave(text.trim().slice(0, LINE_MAX), gratitude);
        setSaved(gratitude);
        setText("");
        setGratitude(false);
      }}
    >
      <label htmlFor="cabin-line" className="block text-sm font-medium">
        Uma linha para o diário
      </label>
      <textarea
        id="cabin-line"
        rows={2}
        maxLength={LINE_MAX}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setSaved(null);
        }}
        placeholder={gratitude ? "Ex.: o café da tarde com a minha irmã" : "O que ficou de hoje?"}
        className={cn(fieldControlClass, "min-h-16 resize-none py-2")}
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={gratitude}
          onChange={(event) => setGratitude(event.target.checked)}
          className="size-5 accent-brand-600"
        />
        É uma coisa boa de hoje (acende uma lanterna à noite)
      </label>
      <Button type="submit" disabled={!text.trim()}>
        Guardar no diário
      </Button>
      {saved !== null && (
        <p role="status" className="text-sm text-brand-ink">
          Guardado no diário
          {saved ? ". Uma lanterna nova vai aparecer no céu à noite." : ": virou um livro na estante."}
        </p>
      )}
    </form>
  );
}

/**
 * Praia: a pedra da preocupação. Jogar no mar não guarda nada (é só soltar);
 * guardar leva a frase para "Preparar a sessão".
 */
export function WorryStone({ onThrow, onKeep }: { onThrow: () => void; onKeep: (text: string) => void }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState<null | "mar" | "sessao">(null);

  return (
    <div className="mt-3 space-y-2">
      <label htmlFor="worry" className="block text-sm font-medium">
        O que está pesando?
      </label>
      <input
        id="worry"
        value={text}
        maxLength={LINE_MAX}
        onChange={(event) => {
          setText(event.target.value);
          setDone(null);
        }}
        placeholder="Escreva na pedra"
        className={fieldControlClass}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!text.trim()}
          onClick={() => {
            onThrow();
            setText("");
            setDone("mar");
          }}
        >
          Jogar no mar
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!text.trim()}
          onClick={() => {
            onKeep(text.trim());
            setText("");
            setDone("sessao");
          }}
        >
          Guardar para a sessão
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Jogar no mar não salva nada. Fica só com você.</p>
      {done && (
        <p role="status" className="text-sm text-brand-ink">
          {done === "mar"
            ? "A pedra afundou. A preocupação pode ficar lá um pouco."
            : "Guardada em Consultas, no Preparar a sessão."}
        </p>
      )}
    </div>
  );
}

const SENSES = [
  { n: 5, text: "Olhe em volta e encontre 5 coisas que você consegue ver." },
  { n: 4, text: "Perceba 4 coisas que você consegue tocar ou sentir no corpo." },
  { n: 3, text: "Escute: 3 sons, perto ou longe." },
  { n: 2, text: "2 cheiros (ou lembre de 2 cheiros que você gosta)." },
  { n: 1, text: "1 respiração lenta. Repare no gosto da sua boca." },
];

/**
 * Farol: o 5-4-3-2-1, um exercício curto de aterramento para a ansiedade, com a raposa.
 * No fim, se ajudou, entra em "O que me ajuda" no plano de segurança.
 */
export function Grounding({ fox, onHelped }: { fox: string; onHelped: () => void }) {
  const [step, setStep] = useState(-1);
  const [answer, setAnswer] = useState<null | boolean>(null);

  if (step < 0)
    return (
      <div className="mt-3">
        <Button type="button" onClick={() => setStep(0)}>
          Fazer o 5-4-3-2-1 com {fox}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">Uns 2 minutos, para quando a ansiedade apertar.</p>
      </div>
    );

  if (step < SENSES.length) {
    const sense = SENSES[step];
    return (
      <div className="mt-3 space-y-2 rounded-2xl bg-canvas p-4" aria-live="polite">
        <p className="text-4xl font-semibold text-brand-ink">{sense.n}</p>
        <p className="text-base">{sense.text}</p>
        <p className="text-xs text-muted-foreground">Sem pressa. Toque quando terminar.</p>
        <Button type="button" onClick={() => setStep(step + 1)}>
          {step === SENSES.length - 1 ? "Terminei" : "Próximo"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-2xl bg-canvas p-4">
      {answer === null ? (
        <>
          <p className="text-base">Ajudou?</p>
          <div className="flex gap-2">
            <button
              type="button"
              className={chip}
              onClick={() => {
                onHelped();
                setAnswer(true);
              }}
            >
              Ajudou
            </button>
            <button type="button" className={chip} onClick={() => setAnswer(false)}>
              Não muito
            </button>
          </div>
        </>
      ) : (
        <p role="status" className="text-sm text-brand-ink">
          {answer
            ? "Que bom. Entrou em “O que me ajuda”, no seu plano de segurança."
            : "Tudo bem. Nem tudo funciona todo dia. O botão de ajuda está sempre no topo."}
        </p>
      )}
      <button
        type="button"
        onClick={() => setStep(-1)}
        className="min-h-11 text-sm underline underline-offset-2"
      >
        Fazer de novo
      </button>
    </div>
  );
}

/** Primeira visita: a raposa mostra os lugares, um de cada vez. */
export const TOUR_KEY = "psycare:island:tour:v1";

export function Tour({
  step,
  total,
  label,
  text,
  onNext,
  onSkip,
}: {
  step: number;
  total: number;
  label: string;
  text: string;
  onNext: () => void;
  onSkip: () => void;
}) {
  const last = step === total - 1;
  return (
    <section
      aria-labelledby="tour-title"
      className="animate-rise rounded-3xl border border-border bg-card/95 p-5 shadow-lg backdrop-blur"
    >
      <p className="text-xs text-muted-foreground">
        Conhecendo a ilha · {step + 1} de {total}
      </p>
      <h2 id="tour-title" className="mt-1 text-lg font-medium">
        {label}
      </h2>
      <p className="mt-1 text-sm">{text}</p>
      <div className="mt-3 flex gap-2">
        <Button type="button" onClick={onNext}>
          {last ? "Entendi" : "Próximo"}
        </Button>
        {!last && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Pular
          </Button>
        )}
      </div>
    </section>
  );
}
