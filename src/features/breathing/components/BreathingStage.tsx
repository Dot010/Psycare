"use client";

import dynamic from "next/dynamic";
import { type MutableRefObject, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

interface StageProps {
  scaleRef: MutableRefObject<{ scale: number }>;
}

/** Alternativa leve ao 3D (celular, ou quem prefere menos movimento): círculo em CSS animado pelo GSAP. */
function Circle({ scaleRef }: StageProps) {
  const circleRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const el = circleRef.current;
      if (!el || reduced) return;

      const update = () => {
        gsap.set(el, { scale: scaleRef.current.scale / 1.08 });
      };
      gsap.ticker.add(update);
      update();
      return () => gsap.ticker.remove(update);
    },
    { scope: circleRef, dependencies: [reduced] },
  );

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        ref={circleRef}
        className="aspect-square w-3/4 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-brand-300),var(--color-brand-700)_70%,var(--color-brand-900))] shadow-[0_0_60px_var(--color-brand-300)]"
      />
    </div>
  );
}

const BlobCanvas = dynamic(() => import("@/components/three/BlobCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-brand-100/40" />,
});

/** Palco da respiração: blob 3D no desktop; círculo CSS no celular ou com "reduzir movimento". */
export function BreathingStage({ scaleRef }: StageProps) {
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const reduced = usePrefersReducedMotion();

  if (isNarrow || reduced) {
    return <Circle scaleRef={scaleRef} />;
  }

  return <BlobCanvas scaleRef={scaleRef} />;
}
