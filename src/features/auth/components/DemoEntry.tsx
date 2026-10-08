"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { demoLoginAction } from "@/features/auth/actions";
import type { DemoProfile } from "@/features/auth/schema";
import { ErrorMessage } from "@/features/auth/components/ErrorMessage";

const OPTIONS: { profile: DemoProfile; title: string; hint: string }[] = [
  { profile: "patient", title: "Paciente", hint: "Jardim, diário, humor e agenda" },
  { profile: "psychologist", title: "Psicólogo", hint: "Pacientes, atividades e notas de sessão" },
  { profile: "psychiatrist", title: "Psiquiatra", hint: "Pacientes e medicação" },
];

/** Entrada sem e-mail nem senha. Só aparece quando o ambiente está em modo demonstração. */
export function DemoEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState<DemoProfile | null>(null);
  const [error, setError] = useState("");

  const enter = async (profile: DemoProfile) => {
    setError("");
    setLoading(profile);
    const result = await demoLoginAction(profile);
    if (result.success) {
      router.push(result.redirectTo);
      return;
    }
    setError(result.error);
    setLoading(null);
  };

  return (
    <section aria-labelledby="demo-title" className="mt-8 w-full">
      <h2 id="demo-title" className="text-base font-semibold text-foreground">
        Explorar a demonstração
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sem e-mail e sem senha. Todos os dados são de exemplo.
      </p>

      <ul className="mt-4 space-y-2">
        {OPTIONS.map(({ profile, title, hint }) => (
          <li key={profile}>
            <button
              type="button"
              onClick={() => enter(profile)}
              disabled={loading !== null}
              className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-brand-400 hover:bg-brand-50 disabled:opacity-60"
            >
              <span>
                <span className="block text-base font-semibold text-foreground">
                  Entrar como {title.toLowerCase()}
                </span>
                <span className="block text-xs text-muted-foreground">{hint}</span>
              </span>
              <span aria-hidden="true" className="text-brand-accent">
                {loading === profile ? "…" : "→"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <ErrorMessage message={error} />
    </section>
  );
}
