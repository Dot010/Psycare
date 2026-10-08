"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/** Número que sobe até o valor (e acompanha quando ele muda). Com "reduzir movimento", aparece direto. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const shown = useRef({ n: 0 });
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        shown.current.n = value;
        el.textContent = String(value);
        return;
      }
      gsap.to(shown.current, {
        n: value,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = String(Math.round(shown.current.n));
        },
      });
    },
    { dependencies: [value, reduced] },
  );

  // O texto inicial já é o valor final: sem ele o servidor e leitores de tela veriam "0".
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
