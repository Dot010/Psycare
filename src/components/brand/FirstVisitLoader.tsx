"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { FADE_MS, markSeen, MAX_VISIBLE_MS, MIN_VISIBLE_MS } from "./first-visit";

/**
 * Tela de abertura em verde, uma vez por sessão do navegador. O servidor já a envia na primeira
 * visita (sem piscar o conteúdo antes). Fica ao menos 0,9 s, sai quando a página termina de carregar
 * e no máximo em 1,6 s. Com "reduzir movimento", a marca fica parada e some sem esmaecer.
 */
export function FirstVisitLoader({ show }: { show: boolean }) {
  const [phase, setPhase] = useState<"on" | "leaving" | "off">(show ? "on" : "off");

  useEffect(() => {
    if (!show) return;
    markSeen();

    const timers: ReturnType<typeof setTimeout>[] = [];
    const startedAt = Date.now();
    let closed = false;

    const leave = () => {
      if (closed) return;
      closed = true;
      setPhase("leaving");
      timers.push(setTimeout(() => setPhase("off"), FADE_MS));
    };
    const onLoad = () => {
      const left = MIN_VISIBLE_MS - (Date.now() - startedAt);
      timers.push(setTimeout(leave, Math.max(0, left)));
    };

    timers.push(setTimeout(leave, MAX_VISIBLE_MS));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      window.removeEventListener("load", onLoad);
      timers.forEach(clearTimeout);
    };
  }, [show]);

  if (phase === "off") return null;

  return (
    <div
      role="status"
      aria-label="Abrindo o PsyCare"
      style={{ transitionDuration: `${FADE_MS}ms` }}
      className={
        "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-primary text-primary-foreground transition-opacity motion-reduce:transition-none " +
        (phase === "leaving" ? "opacity-0" : "opacity-100")
      }
    >
      <div className="rounded-3xl bg-card p-5 shadow-xl">
        <BrandMark className="size-14 animate-sway" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-3xl font-bold">Psy Care</p>
        <p className="text-sm text-primary-foreground/80">Seu espaço de cuidado</p>
      </div>
    </div>
  );
}
