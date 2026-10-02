"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {

        try {
            const saved = localStorage.getItem(key);

            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (saved !== null) setValue(JSON.parse(saved));

        } catch {

        }
        setLoaded(true)
    }, [key])

  // 2) Toda vez que o valor muda, salva
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // armazenamento cheio ou bloqueado: ignora
    }
  }, [key, value, loaded]);

  return [value, setValue] as const;

}