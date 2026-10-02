"use client";

import { type ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { useCanHover, usePrefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

type Setter = (value: number) => unknown;

/**
 * Card que inclina levemente com o mouse. Use com moderação (cards de destaque):
 * só liga em dispositivos com hover real e quando o usuário não pediu menos movimento.
 */
export function TiltCard({ children, className }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const setters = useRef<{ rotateX: Setter; rotateY: Setter; y: Setter } | null>(null);
  const reduced = usePrefersReducedMotion();
  const canHover = useCanHover();
  const enabled = canHover && !reduced;

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card || !enabled) return;

      gsap.set(card, { transformPerspective: 900, transformOrigin: "center" });
      const opts = { duration: 0.4, ease: "power2.out" };
      setters.current = {
        rotateX: gsap.quickTo(card, "rotateX", opts),
        rotateY: gsap.quickTo(card, "rotateY", opts),
        y: gsap.quickTo(card, "y", opts),
      };

      return () => {
        setters.current = null;
      };
    },
    { scope: cardRef, dependencies: [enabled] },
  );

  const onMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const card = cardRef.current;
    const quick = setters.current;
    if (!card || !quick) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    quick.rotateY((px - 0.5) * 8);
    quick.rotateX((0.5 - py) * 8);
    quick.y(-4);
  };

  const onLeave = () => {
    const quick = setters.current;
    if (!quick) return;
    quick.rotateX(0);
    quick.rotateY(0);
    quick.y(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(enabled && "will-change-transform", className)}
    >
      {children}
    </div>
  );
}
