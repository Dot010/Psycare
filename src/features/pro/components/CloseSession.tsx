"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { ACTIVITIES, ACTIVITY_KINDS } from "@/features/activities/catalog";
import type { ActivityKind } from "@/features/activities/types";
import { addDays } from "@/features/health/logic";
import { formatCurrencyBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { EVOLUTION_MAX } from "../logic";
import type { CloseSessionInput } from "../hooks/usePro";

const choice = (on: boolean) =>
  cn(
    "min-h-11 rounded-full border px-4 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
    on
      ? "border-primary bg-primary font-semibold text-primary-foreground"
      : "border-border bg-card hover:border-brand-600",
  );

interface CloseSessionProps {
  patientName: string;
  fee: number;
  today: string;
  /** "sessão" para a psicóloga, "consulta" para o psiquiatra. */
  noun: "sessão" | "consulta";
  by: string;
  onClose: (input: CloseSessionInput) => string | null;
  onCancel: () => void;
}

/**
 * O "Encerrar sessão" em 4 passos curtos, na própria linha da sessão:
 * como foi, a evolução, a cobrança e (se quiser) uma tarefa para casa.
 */
export function CloseSession({ patientName, fee, today, noun, by, onClose, onCancel }: CloseSessionProps) {
  const id = useId();
  const [outcome, setOutcome] = useState<CloseSessionInput["outcome"]>(null);
  const [evolution, setEvolution] = useState("");
  const [paid, setPaid] = useState(false);
  const [chargeMissed, setChargeMissed] = useState(false);
  const [homework, setHomework] = useState<ActivityKind | "">("");
  const [due, setDue] = useState(addDays(today, 7));
  const [error, setError] = useState("");
  const first = patientName.split(" ")[0];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = onClose({
      outcome,
      evolution,
      paid,
      chargeMissed,
      by,
      homework: homework ? { kind: homework, dueDate: due } : undefined,
    });
    if (result) setError(result);
  };

  return (
    <form
      onSubmit={submit}
      aria-label={`Encerrar ${noun} de ${patientName}`}
      className="animate-rise space-y-5 rounded-2xl bg-canvas p-5"
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">1. Como foi?</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={outcome === "realizada"}
            className={choice(outcome === "realizada")}
            onClick={() => setOutcome("realizada")}
          >
            {noun === "sessão" ? "Sessão realizada" : "Consulta realizada"}
          </button>
          <button
            type="button"
            aria-pressed={outcome === "faltou"}
            className={choice(outcome === "faltou")}
            onClick={() => setOutcome("faltou")}
          >
            O paciente faltou
          </button>
        </div>
      </fieldset>

      {outcome === "realizada" && (
        <>
          <div className="space-y-2">
            <label htmlFor={`${id}-evo`} className="block text-sm font-semibold">
              2. Evolução da {noun}
            </label>
            <textarea
              id={`${id}-evo`}
              rows={4}
              maxLength={EVOLUTION_MAX}
              value={evolution}
              onChange={(e) => setEvolution(e.target.value)}
              placeholder="Como chegou, o que foi trabalhado, o que ficou combinado."
              className={cn(fieldControlClass, "min-h-28 resize-y py-3")}
            />
            <p className="text-xs text-muted-foreground">
              Vai para o prontuário de {first}. Só você vê. O paciente nunca vê este texto.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">3. Cobrança · {formatCurrencyBRL(fee)}</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={paid}
                className={choice(paid)}
                onClick={() => setPaid(true)}
              >
                Já foi pago
              </button>
              <button
                type="button"
                aria-pressed={!paid}
                className={choice(!paid)}
                onClick={() => setPaid(false)}
              >
                Fica pendente
              </button>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">4. Tarefa para casa (opcional)</legend>
            <div className="flex flex-wrap gap-2">
              <label htmlFor={`${id}-hw`} className="sr-only">
                Atividade
              </label>
              <select
                id={`${id}-hw`}
                value={homework}
                onChange={(e) => setHomework(e.target.value as ActivityKind | "")}
                className={cn(fieldControlClass, "w-auto min-w-56 flex-1")}
              >
                <option value="">Sem tarefa desta vez</option>
                {ACTIVITY_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {ACTIVITIES[kind].title}
                  </option>
                ))}
              </select>
              {homework && (
                <>
                  <label htmlFor={`${id}-due`} className="sr-only">
                    Para quando
                  </label>
                  <input
                    id={`${id}-due`}
                    type="date"
                    min={today}
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className={cn(fieldControlClass, "w-auto")}
                  />
                </>
              )}
            </div>
            {homework && (
              <p className="text-xs text-muted-foreground">
                Aparece em Atividades de {first}, com o prazo, e rende uma gota para o jardim quando fizer.
              </p>
            )}
          </fieldset>
        </>
      )}

      {outcome === "faltou" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            A falta fica registrada no prontuário de qualquer jeito.
          </p>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={chargeMissed}
              onChange={(e) => setChargeMissed(e.target.checked)}
              className="size-4 accent-brand-600"
            />
            Cobrar a falta ({formatCurrencyBRL(fee)}, fica pendente)
          </label>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">Encerrar e salvar</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
