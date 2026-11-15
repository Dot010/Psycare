"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface ProgressRingProps {
  /** De 0 a 1. Valores fora disso são cortados. */
  value: number;
  /** Texto para leitores de tela ("4 de 7 dias"). O desenho em si é decorativo. */
  label: string;
  size?: number;
  /** Espessura do anel, na escala de 0 a 100 do desenho. */
  thickness?: number;
  /** Classes de cor do trilho e do anel (stroke-*). */
  trackClassName?: string;
  barClassName?: string;
  /** O que fica no meio do anel (um número, um texto curto). */
  children?: ReactNode;
  className?: string;
}

/**
 * Anel de progresso. Ao aparecer, ele se fecha do zero até o valor; quando o valor muda, desliza.
 * Com "menos movimento", a regra global do CSS zera a transição e ele aparece direto.
 */
export function ProgressRing({
  value,
  label,
  size = 96,
  thickness = 10,
  trackClassName = "stroke-brand-100",
  barClassName = "stroke-primary",
  children,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, value));
  // Começa vazio e só depois de montar vai ao valor: é isso que faz o anel "se fechar" na entrada.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="-rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" strokeWidth={thickness} className={trackClassName} />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - shown)}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-(--motion-ease-emphasis)",
            barClassName,
          )}
          data-testid="progress-ring-bar"
        />
      </svg>
      {children && (
        <span aria-hidden className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </span>
      )}
    </div>
  );
}
