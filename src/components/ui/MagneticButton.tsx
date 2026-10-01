"use client";

import { type ButtonHTMLAttributes, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 0.28,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleMove: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;

    gsap.to(button, {
      x,
      y,
      duration: 0.35,
      ease: "power3.out",
    });

    onMouseMove?.(event);
  };

  const handleLeave: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const button = buttonRef.current;
    if (button) {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1, 0.45)",
      });
    }

    onMouseLeave?.(event);
  };

  return (
    <button
      ref={buttonRef}
      className={cn("will-change-transform", className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </button>
  );
}
