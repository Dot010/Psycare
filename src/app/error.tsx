"use client";

import { ErrorState } from "@/components/feedback/ErrorState";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      fullScreen
      error={error}
      reset={reset}
      title="Algo deu errado"
      description="Tivemos um erro temporário. Você pode tentar novamente sem perder o que já fez."
      actionLabel="Tentar novamente"
    />
  );
}
