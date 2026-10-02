"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Lê uma media query de forma segura para SSR: no servidor devolve `serverValue`
 * e, depois da hidratação, o valor real (e atualiza se o usuário mudar a preferência).
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** O usuário pediu menos movimento no sistema operacional. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Dispositivo com mouse de verdade (efeitos de hover não fazem sentido em touch). */
export function useCanHover(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
