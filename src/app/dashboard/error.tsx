"use client";

import { ErrorState } from "@/components/feedback/ErrorState";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="Não foi possível carregar esta área"
      description="Verifique sua conexão e tente recarregar."
      actionLabel="Recarregar"
    />
  );
}
