"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/** Marca de "feito" que é desenhada traço a traço ao ser marcada. */
export function AnimatedCheck({ className }: { className?: string }) {
  const path = useRef<SVGPathElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(() => {
    if (reduced || !path.current) return;
    gsap.fromTo(
      path.current,
      { strokeDasharray: 1, strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" },
    );
  });

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        ref={path}
        d="M5 12.5l4.5 4.5L19 7.5"
        pathLength={1}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
