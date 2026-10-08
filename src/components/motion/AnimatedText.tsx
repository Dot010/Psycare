"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(SplitText, useGSAP);

interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * Título que "sobe" letra a letra. Usa o SplitText do GSAP, que mantém o texto acessível
 * (aria-label no elemento) e refaz a divisão quando a fonte termina de carregar ou a largura muda.
 * Com "reduzir movimento" ativo, o texto aparece direto, sem animação.
 */
export function AnimatedText({ text, className, as = "h2" }: AnimatedTextProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = rootRef.current?.firstElementChild as HTMLElement | null;
      if (!el) return;

      if (reduced) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      SplitText.create(el, {
        type: "lines,chars",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          return gsap.from(self.chars, {
            yPercent: 120,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.02,
          });
        },
      });
    },
    { scope: rootRef, dependencies: [reduced], revertOnUpdate: true },
  );

  const Tag = as;

  return (
    <div ref={rootRef}>
      {/* invisible até o GSAP revelar, para o texto não "piscar" antes da animação */}
      <Tag className={cn("invisible leading-tight", className)}>{text}</Tag>
    </div>
  );
}
