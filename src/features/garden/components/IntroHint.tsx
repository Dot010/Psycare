"use client";

import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/lib/useLocalStorage";

const INTRO_KEY = "psycare:garden-intro:v1";

/** Dica de primeira visita: aparece uma vez, explica a ideia em duas frases e some depois do "Entendi". */
export function IntroHint() {
  const [seen, setSeen] = useLocalStorage<boolean>(INTRO_KEY, false);
  if (seen) return null;

  return (
    <div
      role="note"
      className="pointer-events-auto max-w-sm rounded-2xl bg-card/95 p-4 text-sm shadow-lg backdrop-blur"
    >
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
