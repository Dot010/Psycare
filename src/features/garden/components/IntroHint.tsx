"use client";

import { Droplets, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/lib/useLocalStorage";

const INTRO_KEY = "psycare:garden-intro:v1";
/** A dica some sozinha para não ficar na frente das plantas. */
const AUTO_HIDE_MS = 9000;

/** Dica de primeira visita: aparece uma vez, explica a ideia em duas frases e some sozinha ou no "Entendi". */
export function IntroHint() {
  const [seen, setSeen] = useLocalStorage<boolean>(INTRO_KEY, false);

  useEffect(() => {
    if (seen) return;
    const timer = setTimeout(() => setSeen(true), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [seen, setSeen]);

  if (seen) return null;

  return (
    <div
      role="note"
      className="pointer-events-auto relative max-w-sm rounded-2xl bg-card/95 p-4 pr-10 text-sm shadow-lg backdrop-blur"
    >
      <button
        type="button"
        aria-label="Fechar dica"
        onClick={() => setSeen(true)}
        className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
      >
        <X className="size-4" aria-hidden />
      </button>
      <p className="flex items-center gap-2 font-bold text-foreground">
        <Droplets className="size-4 text-brand-accent" aria-hidden />
        Este é o seu jardim
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Cuide de você (check-in, hábitos, diário, respiração) para ganhar gotas. Depois toque em{" "}
        <strong className="text-foreground">Regar</strong> e veja as plantas crescerem.
      </p>
      <Button size="sm" className="mt-3" onClick={() => setSeen(true)}>
        Entendi
      </Button>
    </div>
  );
}
