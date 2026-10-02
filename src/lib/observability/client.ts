"use client";

import * as Sentry from "@sentry/nextjs";

let hasInitialized = false;

/**
 * Monitoramento de erros (opcional): só liga se NEXT_PUBLIC_SENTRY_DSN existir.
 * App de saúde mental: sem session replay e sem envio de dados pessoais (padrão do Sentry),
 * para que textos de diário, mensagens e e-mails nunca saiam do navegador.
 */
export function initClientObservability() {
  if (hasInitialized || typeof window === "undefined") {
    return;
  }

  hasInitialized = true;

  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!sentryDsn) return;

  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    enabled: process.env.NODE_ENV !== "test",
  });
}
