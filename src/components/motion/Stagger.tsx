"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/** Os filhos diretos entram em cascata (sobem e aparecem). Anima uma vez, ao montar. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;
      gsap.from(ref.current.children, {
        y: 14,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.07,
        clearProps: "transform,opacity",
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
