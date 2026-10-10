"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { COMMON_SYMPTOMS, INTENSITY_LABELS } from "@/features/health/logic";
import { cn } from "@/lib/utils";

interface SymptomLoggerProps {
  onLog: (names: string[], intensity: number) => void;
  /** Prefixo dos ids, para poder ter dois registradores na mesma tela. */
  idPrefix?: string;
}

export function SymptomLogger({ onLog, idPrefix = "sintoma" }: SymptomLoggerProps) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(3);
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState(false);

  const toggle = (name: string) =>
    setChosen((current) => (current.includes(name) ? current.filter((n) => n !== name) : [...current, name]));

  const addCustom = () => {
    const name = custom.replace(/\s+/g, " ").trim().slice(0, 30);
    if (name.length < 2) return;
    setChosen((current) =>
      current.some((n) => n.toLowerCase() === name.toLowerCase()) ? current : [...current, name],
    );
    setCustom("");
  };

  const options = [...COMMON_SYMPTOMS, ...chosen.filter((n) => !COMMON_SYMPTOMS.includes(n))];

  const save = () => {
    onLog(chosen, intensity);
    setChosen([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Sintomas de hoje">
        {options.map((name) => {
          const on = chosen.includes(name);
          return (
            <button
              key={name}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(name)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                on
                  ? "border-brand-600 bg-brand-100 font-medium text-brand-ink"
                  : "border-border text-foreground hover:border-brand-600",
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`${idPrefix}-outro`}>
          Outro sintoma
        </label>
        <input
          id={`${idPrefix}-outro`}
          value={custom}
          maxLength={30}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Outro…"
          className="h-11 w-40 rounded-full border border-border bg-card px-4 text-sm"
        />
        <Button type="button" variant="ghost" onClick={addCustom} disabled={custom.trim().length < 2}>
          Adicionar
        </Button>
      </div>

      {chosen.length > 0 && (
        <div role="radiogroup" aria-label="Intensidade" className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Intensidade:{" "}
            <span className="font-medium text-foreground">{INTENSITY_LABELS[intensity - 1]}</span>
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={intensity === n}
                aria-label={`${n} de 5, ${INTENSITY_LABELS[n - 1]}`}
                onClick={() => setIntensity(n)}
                className={cn(
                  "size-11 rounded-full border-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                  n <= intensity
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-300 text-foreground",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <Button onClick={save}>Registrar</Button>
        </div>
      )}
      {saved && (
        <p role="status" className="animate-page-in text-sm text-brand-ink">
          Anotado. Isso ajuda a conversar na consulta.
        </p>
      )}
    </div>
  );
}
