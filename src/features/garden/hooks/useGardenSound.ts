"use client";

import { useEffect } from "react";
import { WATER_EVENT } from "@/features/garden/water";
import { playDrop, startAmbient, stopAmbient, unlockAudio } from "@/lib/sound";
import { useLocalStorage } from "@/lib/useLocalStorage";

const SOUND_KEY = "psycare:sound:v1";

/** Som do jardim (gota e riacho). Começa desligado; o botão liga e lembra a escolha. */
export function useGardenSound() {
  const [enabled, setEnabled] = useLocalStorage<boolean>(SOUND_KEY, false);

  useEffect(() => {
    if (!enabled) return;
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    startAmbient();
    const onWater = () => playDrop();
    window.addEventListener(WATER_EVENT, onWater);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener(WATER_EVENT, onWater);
      stopAmbient();
    };
  }, [enabled]);

  const toggle = () => {
    // O toque no botão é o gesto que libera o som no navegador.
    unlockAudio();
    setEnabled(!enabled);
  };

  return { enabled, toggle };
}
