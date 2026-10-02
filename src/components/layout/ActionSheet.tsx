"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

export const SHEET_SNAPS = ["peek", "half", "full"] as const;
export type SheetSnap = (typeof SHEET_SNAPS)[number];

const PEEK_PX = 84;

/** Altura visível (px) da gaveta em cada posição, dada a altura do espaço disponível. */
export function snapHeight(snap: SheetSnap, available: number, topInset = 12): number {
  const full = Math.max(PEEK_PX, available - topInset);
  if (snap === "peek") return PEEK_PX;
  if (snap === "half") return Math.min(Math.round(available * 0.5), full);
  return full;
}

/** Posição mais próxima de uma altura visível qualquer (usada ao soltar o arrasto). */
export function nearestSnap(visible: number, available: number, topInset = 12): SheetSnap {
  return SHEET_SNAPS.reduce((best, snap) =>
    Math.abs(snapHeight(snap, available, topInset) - visible) <
    Math.abs(snapHeight(best, available, topInset) - visible)
      ? snap
      : best,
  );
}

interface ActionSheetProps {
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  /** Texto visível quando a gaveta está recolhida. */
  title: string;
  /** Espaço livre no topo quando a gaveta está aberta (para o cabeçalho da página continuar visível). */
  topInset?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Gaveta que sobe da parte de baixo do espaço pai (que precisa ser `relative`).
 * Três posições: recolhida, metade e aberta. Arraste a alça, use as setas ↑ ↓ ou toque nela.
 */
export function ActionSheet({
  snap,
  onSnapChange,
  title,
  topInset = 12,
  children,
  className,
}: ActionSheetProps) {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [available, setAvailable] = useState(640);
  const [dragDelta, setDragDelta] = useState<number | null>(null);
  const drag = useRef({ startY: 0, moved: false });

  // Acompanha a altura do espaço onde a gaveta mora.
  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(Math.round(entry.contentRect.height)));
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const sheetHeight = snapHeight("full", available, topInset);
  const baseVisible = snapHeight(snap, available, topInset);
  const visible =
    dragDelta === null ? baseVisible : Math.min(sheetHeight, Math.max(PEEK_PX, baseVisible - dragDelta));

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, moved: false };
    setDragDelta(0);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragDelta === null) return;
    const delta = event.clientY - drag.current.startY;
    if (Math.abs(delta) > 4) drag.current.moved = true;
    setDragDelta(delta);
  };

  const onPointerUp = () => {
    if (dragDelta === null) return;
    if (drag.current.moved) {
      onSnapChange(nearestSnap(visible, available, topInset));
    } else {
      // Toque simples: avança para a próxima posição.
      onSnapChange(SHEET_SNAPS[(SHEET_SNAPS.indexOf(snap) + 1) % SHEET_SNAPS.length]);
    }
    setDragDelta(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = SHEET_SNAPS.indexOf(snap);
    if (event.key === "ArrowUp" && index < SHEET_SNAPS.length - 1) {
      event.preventDefault();
      onSnapChange(SHEET_SNAPS[index + 1]);
    }
    if (event.key === "ArrowDown" && index > 0) {
      event.preventDefault();
      onSnapChange(SHEET_SNAPS[index - 1]);
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-3xl flex-col rounded-t-3xl border border-b-0 border-border bg-card shadow-[0_-8px_30px_rgb(77_31_26/0.12)]",
        dragDelta === null && !reduced && "transition-[height] duration-300 ease-out",
        className,
      )}
      style={{ height: visible }}
    >
      <button
        type="button"
        aria-expanded={snap !== "peek"}
        aria-label={`${title}. Arraste, toque ou use as setas para abrir e fechar o painel.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDragDelta(null)}
        onKeyDown={onKeyDown}
        className="flex h-[84px] w-full shrink-0 touch-none cursor-grab flex-col items-center justify-center gap-1.5 rounded-t-3xl focus-visible:ring-3 focus-visible:ring-brand-600 focus-visible:outline-none active:cursor-grabbing"
      >
        <span aria-hidden className="h-1.5 w-10 rounded-full bg-taupe" />
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          {title}
          <ChevronUp
            aria-hidden
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              snap === "full" && "rotate-180",
            )}
          />
        </span>
      </button>

      <div
        inert={snap === "peek"}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 md:px-6"
      >
        {children}
      </div>
    </div>
  );
}
