"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { isPresentationPath, MAX_WAIT_MS, STILL_MS } from "./first-visit";

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Abertura em verde ao entrar no app (login, cadastro e raiz): a marca se desenha, o nome sobe e a
 * tela sobe revelando a página. Roda a cada carregamento dessas telas; navegar dentro do app não a
 * repete. Espera a página terminar de carregar (no máximo 3,5 s). Com "reduzir movimento", mostra a
 * marca parada por 0,9 s e sai sem animar.
 */
export function FirstVisitLoader() {
  const pathname = usePathname();
  // O servidor já envia a tela, então o conteúdo não aparece antes dela.
  const [visible, setVisible] = useState(() => isPresentationPath(pathname));
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!visible || !root.current) return;
      const q = gsap.utils.selector(root.current);
      const done = () => setVisible(false);

      if (prefersReducedMotion()) {
        const timer = setTimeout(done, STILL_MS);
        return () => clearTimeout(timer);
      }

      let introDone = false;
      let pageReady = document.readyState === "complete";
      let leaving = false;

      const leave = () => {
        if (leaving) return;
        leaving = true;
        gsap.to(root.current, { yPercent: -100, duration: 0.6, ease: "power3.inOut", onComplete: done });
      };
      const tryLeave = () => introDone && pageReady && leave();

      const onLoad = () => {
        pageReady = true;
        tryLeave();
      };
      if (!pageReady) window.addEventListener("load", onLoad, { once: true });
      const cap = setTimeout(() => introDone && leave(), MAX_WAIT_MS);

      gsap.set(q(".splash-card"), { scale: 0.6, opacity: 0 });
      gsap.set(q(".splash-stem"), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q(".splash-leaf"), { scale: 0, transformBox: "fill-box", transformOrigin: "0% 100%" });
      gsap.set(q(".splash-text"), { y: 18, opacity: 0 });

      gsap
        .timeline({
          onComplete: () => {
            introDone = true;
            tryLeave();
          },
        })
        .to(q(".splash-card"), { scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.7)" })
        .to(q(".splash-stem"), { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" }, "-=0.15")
        .to(q(".splash-leaf"), { scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.14 }, "-=0.1")
        .to(
          q(".splash-text"),
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.12 },
          "-=0.3",
        )
        .to({}, { duration: 0.25 });

      return () => {
        clearTimeout(cap);
        window.removeEventListener("load", onLoad);
      };
    },
    { scope: root, dependencies: [visible] },
  );

  if (!visible) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Abrindo o PsyCare"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-primary text-primary-foreground"
    >
      <div className="splash-card rounded-3xl bg-card p-5 shadow-xl">
        <svg width="56" height="56" viewBox="0 0 26 26" aria-hidden="true">
          <path
            className="splash-stem"
            d="M13 24 V12"
            pathLength={1}
            stroke="#5e7638"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path className="splash-leaf" d="M13 15 C5 14 3 8 4 4 C10 4 14 9 13 15Z" fill="#8ea466" />
          <path className="splash-leaf" d="M13 11 C20 11 23 6 22 2 C16 2 12 6 13 11Z" fill="#5e7638" />
        </svg>
      </div>
      <div className="space-y-1 text-center">
        <p className="splash-text text-3xl font-bold">Psy Care</p>
        <p className="splash-text text-sm text-primary-foreground/80">Seu espaço de cuidado</p>
      </div>
    </div>
  );
}
