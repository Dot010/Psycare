"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { BreathingStage } from "@/features/breathing/components/BreathingStage";
import { useBreathingSession } from "@/features/breathing/hooks/useBreathingSession";
import {
  formatClock,
  SESSION_MINUTES,
  TECHNIQUES,
} from "@/features/breathing/techniques";
import { cn } from "@/lib/utils";

export default function BreathingView() {
  const [techniqueId, setTechniqueId] = useState(TECHNIQUES[0].id);
  const [minutes, setMinutes] = useState<(typeof SESSION_MINUTES)[number]>(3);

  const technique = TECHNIQUES.find((t) => t.id === techniqueId) ?? TECHNIQUES[0];
  const sessionSeconds = minutes * 60;
  const { scaleRef, view, start, pause, resume, reset } = useBreathingSession(
    technique,
    sessionSeconds,
  );

  const { status, position, elapsed } = view;
  const isActive = status === "running" || status === "paused";

  const headline =
    status === "idle"
      ? "Pronto?"
      : status === "paused"
        ? "Pausado"
        : status === "done"
          ? "Sessão concluída"
          : (position?.phase.label ?? "");

  const subline =
    status === "idle"
      ? "Comece quando quiser"
      : status === "done"
        ? "Obrigado por se dar esse tempo"
        : status === "paused"
          ? "Retome quando estiver pronto"
          : String(position?.remaining ?? "");

  return (
    <div className="max-w-5xl space-y-8 p-6 md:p-8">
      <header className="space-y-1">
        <AnimatedText
          as="h1"
          text="Respiração Guiada"
          className="text-2xl font-bold text-slate-800"
        />
        <p className="text-sm text-slate-500">
          Acompanhe o círculo: ele cresce quando você inspira e encolhe quando você expira.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        {/* Palco */}
        <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-brand-50/60">
          <BreathingStage scaleRef={scaleRef} />

          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center text-white [text-shadow:0_1px_10px_rgb(0_0_0/0.4)]">
            <div className="space-y-1 px-6">
              <p className="font-heading text-3xl font-semibold md:text-4xl">{headline}</p>
              <p
                className={cn(
                  "text-lg opacity-90",
                  status === "running" && "font-mono text-5xl tabular-nums",
                )}
              >
                {subline}
              </p>
            </div>
          </div>

          {/* Anúncio para leitores de tela: só quando a fase muda, sem a contagem a cada segundo */}
          <p className="sr-only" role="status" aria-live="polite">
            {status === "running" && position ? position.phase.label : headline}
          </p>
        </div>

        {/* Controles */}
        <div className="space-y-6">
          <fieldset className="space-y-2" disabled={isActive}>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Técnica
            </legend>
            {TECHNIQUES.map((t) => (
              <label
                key={t.id}
                className={cn(
                  "block cursor-pointer rounded-xl border bg-white p-3 transition has-checked:border-brand-600 has-checked:bg-brand-50 has-disabled:cursor-not-allowed has-disabled:opacity-60",
                  "border-slate-200 has-focus-visible:ring-2 has-focus-visible:ring-brand-600/40",
                )}
              >
                <input
                  type="radio"
                  name="technique"
                  value={t.id}
                  checked={t.id === techniqueId}
                  onChange={() => {
                    reset();
                    setTechniqueId(t.id);
                  }}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold text-slate-800">{t.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{t.description}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="space-y-2" disabled={isActive}>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Duração
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {SESSION_MINUTES.map((m) => (
                <label
                  key={m}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white py-2 text-center text-sm font-semibold text-slate-600 transition has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:text-brand-800 has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:ring-2 has-focus-visible:ring-brand-600/40"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={m}
                    checked={m === minutes}
                    onChange={() => {
                      reset();
                      setMinutes(m);
                    }}
                    className="sr-only"
                  />
                  {m} min
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-3">
            <div className="flex gap-2">
              {status === "running" ? (
                <button
                  type="button"
                  onClick={pause}
                  className="flex-1 rounded-xl bg-brand-800 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                >
                  Pausar
                </button>
              ) : status === "paused" ? (
                <button
                  type="button"
                  onClick={resume}
                  className="flex-1 rounded-xl bg-brand-800 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                >
                  Retomar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={start}
                  className="flex-1 rounded-xl bg-brand-800 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                >
                  {status === "done" ? "Fazer de novo" : "Começar"}
                </button>
              )}

              {(isActive || status === "done") && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Parar
                </button>
              )}
            </div>

            {isActive && (
              <p className="text-center text-xs tabular-nums text-slate-500">
                Restam {formatClock(sessionSeconds - elapsed)} · ciclo {position?.cycle ?? 1}
              </p>
            )}

            {status === "done" && (
              <p className="text-center text-sm text-slate-600">
                Como você se sente agora?{" "}
                <Link
                  href="/dashboard/diary"
                  className="font-semibold text-brand-800 underline underline-offset-2"
                >
                  Registrar no diário
                </Link>
              </p>
            )}
          </div>

          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            Respire de forma confortável. Se sentir tontura, volte ao ritmo normal. Este exercício
            não substitui acompanhamento profissional. Em crise, ligue para o CVV: <strong>188</strong>{" "}
            (24 horas, gratuito).
          </p>
        </div>
      </div>
    </div>
  );
}
