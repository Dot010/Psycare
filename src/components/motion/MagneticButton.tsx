"use client";

import { type ButtonHTMLAttributes, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useCanHover, usePrefersReducedMotion } from "@/lib/motion";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
}

/**
 * Botão que "puxa" levemente em direção ao cursor. Reserve para a ação principal da tela:
 * em formulários e listas, um botão que se move atrapalha a precisão do clique.
 * Desligado em touch e com "reduzir movimento".
 */
export function MagneticButton({
  children,
  className,
  strength = 0.28,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const canHover = useCanHover();
  const enabled = canHover && !reduced;

  const handleMove: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const button = buttonRef.current;
    if (button && enabled) {
      const rect = button.getBoundingClientRect();
      gsap.to(button, {
        x: (event.clientX - rect.left - rect.width / 2) * strength,
        y: (event.clientY - rect.top - rect.height / 2) * strength,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
    onMouseMove?.(event);
  };

  const handleLeave: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const button = buttonRef.current;
    if (button && enabled) {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1, 0.45)",
        overwrite: "auto",
      });
    }
    onMouseLeave?.(event);
  };

  return (
    <button
      ref={buttonRef}
      className={cn(enabled && "will-change-transform", className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </button>
  );
}
