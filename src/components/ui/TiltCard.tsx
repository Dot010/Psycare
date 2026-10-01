"use client";

import { type ReactNode, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const onMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 8;
    const rotateX = (0.5 - py) * 8;

    gsap.to(card, {
      rotateX,
      rotateY,
      y: -4,
      transformPerspective: 900,
      transformOrigin: "center",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const onLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 0.55,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("will-change-transform", className)}
    >
      {children}
    </div>
  );
}
