"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { claimFirstVisit, MAX_VISIBLE_MS, MIN_VISIBLE_MS, SHOW_AFTER_MS } from "./first-visit";

/**
 * Tela de abertura com a marca, uma vez por sessão. Nunca segura o conteúdo: só aparece se a página
 * demorar mais de 200 ms, fica ao menos 400 ms e sai no máximo em 1 s. Com "reduzir movimento",
 * mostra a marca parada.
 */
export function FirstVisitLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (document.readyState === "complete" || !claimFirstVisit()) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let shownAt = 0;
    let loaded = false;
    let closed = false;

    const close = () => {
      if (closed) return;
      closed = true;
      setVisible(false);
    };

    const onLoad = () => {
      loaded = true;
      if (shownAt === 0) return; // ainda não apareceu: nem vai aparecer
      const left = MIN_VISIBLE_MS - (Date.now() - shownAt);
      timers.push(setTimeout(close, Math.max(0, left)));
    };

    timers.push(
      setTimeout(() => {
        if (loaded) return;
        shownAt = Date.now();
        setVisible(true);
        timers.push(setTimeout(close, MAX_VISIBLE_MS));
      }, SHOW_AFTER_MS),
    );

    window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Abrindo o PsyCare"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-canvas"
    >
      <BrandMark className="size-16 animate-sway" />
      <p className="text-2xl font-semibold text-brand-ink">Psy Care</p>
    </div>
  );
}
