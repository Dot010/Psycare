"use client";

import { useCallback, useSyncExternalStore } from "react";
import { readStored, subscribeStored, writeStored } from "@/lib/storage";

type Updater<T> = T | ((current: T) => T);

/**
 * Como o useState, mas guardado no navegador. Vários componentes com a mesma chave
 * ficam sincronizados. No servidor (e na primeira renderização) devolve `initialValue`.
 * `initialValue` deve ser uma constante, não um objeto novo a cada render.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const subscribe = useCallback((listener: () => void) => subscribeStored(key, listener), [key]);
  const getSnapshot = useCallback(() => readStored<T>(key, initialValue), [key, initialValue]);
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: Updater<T>) => {
      const current = readStored<T>(key, initialValue);
      writeStored(key, typeof next === "function" ? (next as (current: T) => T)(current) : next);
    },
    [key, initialValue],
  );

  return [value, setValue] as const;
}
