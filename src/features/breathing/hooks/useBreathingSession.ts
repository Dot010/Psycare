"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  phaseAt,
  scaleForPhase,
  SCALE_EMPTY,
  type PhasePosition,
  type Technique,
} from "@/features/breathing/techniques";

export type SessionStatus = "idle" | "running" | "paused" | "done";

export interface SessionView {
  status: SessionStatus;
  position: PhasePosition | null;
  /** Segundos já respirados na sessão. */
  elapsed: number;
}

const IDLE_VIEW: SessionView = { status: "idle", position: null, elapsed: 0 };

/**
 * Controla a sessão de respiração. Uma timeline do GSAP anima `scaleRef.current.scale`
 * (que o blob 3D ou o círculo leem a cada frame) e a mesma timeline serve de relógio
 * para o texto da fase, então visual e instrução nunca saem de sincronia.
 */
export function useBreathingSession(technique: Technique, sessionSeconds: number) {
  const scaleRef = useRef({ scale: SCALE_EMPTY });
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const tickRef = useRef<(() => void) | null>(null);
  const lastKeyRef = useRef("");
  const [view, setView] = useState<SessionView>(IDLE_VIEW);

  const stopTicker = useCallback(() => {
    if (tickRef.current) {
      gsap.ticker.remove(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const teardown = useCallback(() => {
    stopTicker();
    timelineRef.current?.kill();
    timelineRef.current = null;
    gsap.killTweensOf(scaleRef.current);
  }, [stopTicker]);

  // Libera tudo ao sair da tela.
  useEffect(() => teardown, [teardown]);

  const settleScale = useCallback(() => {
    gsap.to(scaleRef.current, { scale: SCALE_EMPTY, duration: 0.9, ease: "sine.inOut" });
  }, []);

  /** Liga o relógio: a cada frame lê a timeline, mas só atualiza o React quando algo visível muda. */
  const startTicker = useCallback(
    (timeline: gsap.core.Timeline) => {
      stopTicker();

      const tick = () => {
        const elapsed = timeline.totalTime();

        if (elapsed >= sessionSeconds) {
          stopTicker();
          timeline.pause();
          settleScale();
          setView({ status: "done", position: null, elapsed: sessionSeconds });
          return;
        }

        const position = phaseAt(technique, elapsed);
        const key = `${position.cycle}-${position.index}-${position.remaining}`;
        if (key === lastKeyRef.current) return;
        lastKeyRef.current = key;
        setView({ status: "running", position, elapsed });
      };

      tickRef.current = tick;
      gsap.ticker.add(tick);
      tick();
    },
    [technique, sessionSeconds, stopTicker, settleScale],
  );

  const start = useCallback(() => {
    teardown();
    lastKeyRef.current = "";
    scaleRef.current.scale = SCALE_EMPTY;

    const timeline = gsap.timeline({ paused: true, repeat: -1 });
    for (const phase of technique.phases) {
      timeline.to(scaleRef.current, {
        scale: scaleForPhase(phase.kind),
        duration: phase.seconds,
        ease: phase.kind === "hold-full" || phase.kind === "hold-empty" ? "none" : "sine.inOut",
      });
    }
    timelineRef.current = timeline;

    timeline.play(0);
    startTicker(timeline);
  }, [technique, teardown, startTicker]);

  const pause = useCallback(() => {
    timelineRef.current?.pause();
    stopTicker();
    setView((current) => ({ ...current, status: "paused" }));
  }, [stopTicker]);

  const resume = useCallback(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    timeline.play();
    startTicker(timeline);
    setView((current) => ({ ...current, status: "running" }));
  }, [startTicker]);

  const reset = useCallback(() => {
    teardown();
    settleScale();
    setView(IDLE_VIEW);
  }, [teardown, settleScale]);

  return { scaleRef, view, start, pause, resume, reset };
}
