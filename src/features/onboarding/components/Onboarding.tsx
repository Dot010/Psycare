"use client";

import { Droplets, Sprout } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { grantWater } from "@/features/garden/water";
import { usePrefs } from "@/features/settings/prefs";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { finish, GOALS, NOT_DONE, ONBOARDING_KEY, STEP_COUNT } from "../logic";

const noopSubscribe = () => () => {};

/** Três telas na primeira visita: o que o app faz, o que a pessoa quer cuidar e a primeira semente. */
export function Onboarding() {
  // Só decide depois de hidratar, para não piscar para quem já passou por aqui.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [state, setState] = useLocalStorage(ONBOARDING_KEY, NOT_DONE);
  const { update } = usePrefs();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string>();
  const [remind, setRemind] = useState(false);
  const [time, setTime] = useState("20:00");

  if (!hydrated || state.done) return null;

  const close = (withSeed: boolean) => {
    if (remind) update({ reminderOn: true, reminderTime: time });
    if (withSeed) grantWater("mission", "primeira-semente");
    setState(finish(goal));
  };

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="gap-6 rounded-2xl p-6 sm:max-w-md"
      >
        <p className="text-xs font-medium tracking-wide text-brand-accent uppercase">
          {step + 1} de {STEP_COUNT}
        </p>

        {step === 0 && (
          <div className="space-y-3">
            <DialogTitle className="text-3xl leading-tight font-semibold text-brand-ink">
              Um lugar calmo para cuidar de você.
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-foreground">
              Registre como você está, escreva quando quiser, acompanhe suas consultas e seus remédios. Sem
              cobrança e sem pressa: o app é seu ritmo.
            </DialogDescription>
            <p className="text-sm text-muted-foreground">
              O PsyCare não faz diagnósticos nem substitui o seu profissional.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <DialogTitle className="text-2xl leading-tight font-semibold text-brand-ink">
              O que você quer cuidar primeiro?
            </DialogTitle>
            <DialogDescription className="sr-only">
              Escolha um objetivo e, se quiser, um lembrete.
            </DialogDescription>
            <div role="radiogroup" aria-label="Objetivo" className="flex flex-col">
              {GOALS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={goal === item}
                  onClick={() => setGoal(item)}
                  className={cn(
                    "min-h-12 border-t border-border py-2 text-left text-base transition-colors first:border-t-0 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                    goal === item ? "font-semibold text-brand-ink" : "text-foreground hover:text-brand-ink",
                  )}
                >
                  <span aria-hidden className="mr-2 inline-block w-4 text-brand-accent">
                    {goal === item ? "●" : "○"}
                  </span>
                  {item}
                </button>
              ))}
            </div>
            <div className="space-y-2 border-t border-border pt-4">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={remind}
                  onChange={(e) => setRemind(e.target.checked)}
                  className="size-5 accent-brand-600"
                />
                Quero um lembrete diário
              </label>
              {remind && (
                <label className="flex items-center gap-3 text-sm text-foreground">
                  Horário
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => e.target.value && setTime(e.target.value)}
                    className="h-11 rounded-lg border border-border bg-card px-3"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Sprout className="size-10 text-brand-accent" aria-hidden />
            <DialogTitle className="text-3xl leading-tight font-semibold text-brand-ink">
              Sua primeira semente.
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-foreground">
              O jardim cresce com o seu cuidado: cada registro, hábito ou respiração rende uma gota. Hoje você
              já começa com uma.
            </DialogDescription>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Droplets className="size-4" aria-hidden /> Regue quando quiser. Se ficar dias sem vir, o jardim
              espera.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {step < STEP_COUNT - 1 ? (
            <>
              <Button variant="ghost" onClick={() => close(false)}>
                Pular
              </Button>
              <Button onClick={() => setStep(step + 1)}>Continuar</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
              <Button onClick={() => close(true)}>Receber minha gota</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
