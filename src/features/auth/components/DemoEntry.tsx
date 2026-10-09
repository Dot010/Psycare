"use client";

import { Spinner } from "@/components/brand/Spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { demoLoginAction } from "@/features/auth/actions";
import type { DemoProfile } from "@/features/auth/schema";
import { countStored, loadDemoData } from "@/features/settings/data";
import { ErrorMessage } from "@/features/auth/components/ErrorMessage";

type Step = "start" | "pro";

const PRO_OPTIONS: { profile: DemoProfile; title: string; hint: string }[] = [
  {
    profile: "psychologist",
    title: "Psicólogo",
    hint: "Pacientes, sessões, atividades entre sessões e evolução do humor",
  },
  {
    profile: "psychiatrist",
    title: "Psiquiatra",
    hint: "Receitas, exames, adesão ao tratamento e efeitos colaterais",
  },
];

const CHOICE_CLASS =
  "flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60";

/** Entrada sem e-mail nem senha. Só aparece quando o ambiente está em modo demonstração. */
export function DemoEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState<DemoProfile | null>(null);
  const [step, setStep] = useState<Step>("start");
  const [error, setError] = useState("");

  const enter = async (profile: DemoProfile) => {
    setError("");
    setLoading(profile);
    const result = await demoLoginAction(profile);
    if (result.success) {
      // Primeira vez neste navegador: já entra com humor, diário e atividades de exemplo, para o paciente
      // não parecer vazio e o profissional ter o que ver.
      if (countStored(window.localStorage) === 0) loadDemoData();
      router.push(result.redirectTo);
      return;
    }
    setError(result.error);
    setLoading(null);
  };

  return (
    <section aria-labelledby="demo-title" className="mt-8 w-full">
      <h2 id="demo-title" className="text-base font-semibold text-foreground">
        {step === "start" ? "Explorar a demonstração" : "Qual é a sua área?"}
      </h2>
      {step === "start" && (
        <p className="mt-1 text-sm text-muted-foreground">
          Sem e-mail e sem senha. Todos os dados são de exemplo.
        </p>
      )}

      {step === "start" ? (
        <ul className="animate-page-in mt-4 space-y-2">
          <li>
            <button
              type="button"
              onClick={() => enter("patient")}
              disabled={loading !== null}
              className={CHOICE_CLASS}
            >
              <span className="text-base font-semibold text-foreground">Entrar como paciente</span>
              <span aria-hidden="true" className="text-brand-accent">
                {loading === "patient" ? <Spinner /> : "→"}
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setStep("pro")}
              disabled={loading !== null}
              className={CHOICE_CLASS}
            >
              <span className="text-base font-semibold text-foreground">Entrar como profissional</span>
              <span aria-hidden="true" className="text-brand-accent">
                →
              </span>
            </button>
          </li>
        </ul>
      ) : (
        <div className="animate-page-in mt-2">
          <button
            type="button"
            onClick={() => setStep("start")}
            disabled={loading !== null}
            className="min-h-11 text-sm font-medium text-brand-ink"
          >
            ← Voltar
          </button>
          <ul className="space-y-2">
            {PRO_OPTIONS.map(({ profile, title, hint }) => (
              <li key={profile}>
                <button
                  type="button"
                  onClick={() => enter(profile)}
                  disabled={loading !== null}
                  className={CHOICE_CLASS}
                >
                  <span>
                    <span className="block text-base font-semibold text-foreground">{title}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                  <span aria-hidden="true" className="text-brand-accent">
                    {loading === profile ? <Spinner /> : "→"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ErrorMessage message={error} />
    </section>
  );
}
