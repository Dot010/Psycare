"use client";

import { ErrorState } from "@/components/feedback/ErrorState";

export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      fullScreen
      error={error}
      reset={reset}
      title="Não foi possível concluir o acesso"
      description="Tente novamente em instantes."
      actionLabel="Tentar novamente"
    />
  );
}
