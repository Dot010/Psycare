"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  error: Error;
  reset: () => void;
  title: string;
  description: string;
  actionLabel: string;
  /** Ocupa a tela inteira (erro fora do dashboard). */
  fullScreen?: boolean;
}

/** Tela de erro padrão dos `error.tsx` do App Router. Registra o erro no Sentry (se estiver configurado). */
export function ErrorState({ error, reset, title, description, actionLabel, fullScreen }: ErrorStateProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      className={cn(
        "flex items-center justify-center p-6",
        fullScreen ? "min-h-screen bg-canvas" : "mx-auto max-w-3xl md:p-8",
      )}
    >
      <div
        role="alert"
        className="w-full max-w-lg space-y-3 rounded-xl border border-black/5 bg-surface p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
