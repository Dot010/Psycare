"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Block } from "@/components/ui/block";
import type { Task } from "../types";

const MINUTES = [15, 25] as const;

/** 900 → "15:00". */
export function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const whiteButton =
  "inline-flex min-h-11 items-center rounded-full bg-card px-5 text-sm font-semibold text-brand-ink transition-transform focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none active:scale-[0.98]";
const ghostButton =
  "inline-flex min-h-11 items-center rounded-full border-[1.5px] border-white/80 px-5 text-sm text-white focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none";

/**
 * "Agora": a próxima tarefa em destaque, com um modo foco de 15 ou 25 minutos.
 * Começar é a parte difícil; um tempo curto e só uma coisa na tela ajudam (pensado para TDAH).
 */
export function FocusNow({ task, onDone }: { task: Task; onDone: () => void }) {
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const focusing = total > 0;
  const finished = focusing && left === 0;

  useEffect(() => {
    if (!focusing || paused || left === 0) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [focusing, paused, left]);

  const start = (minutes: number) => {
    setTotal(minutes * 60);
    setLeft(minutes * 60);
    setPaused(false);
  };
  const stop = () => {
    setTotal(0);
    setLeft(0);
  };

  return (
    <Block
      tone="brand"
      size="lg"
      title="Agora"
      className="[&_h2]:text-sm [&_h2]:font-medium [&_h2]:opacity-85"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
        <div className="min-w-0 flex-1 basis-64 space-y-2">
          <p className="text-2xl leading-snug font-medium break-words">
            {task.title}
            {task.time && <span className="ml-2 text-base font-normal opacity-85">às {task.time}</span>}
          </p>
          <p className="text-sm opacity-85" aria-live="polite">
            {finished
              ? "O tempo de foco acabou. Se não terminou, tudo bem: o que você fez já conta."
              : focusing
                ? "Só isso na tela. O resto espera."
                : "Começar é a parte mais difícil. 15 minutos já valem."}
          </p>

          {task.readonly ? (
            task.href && (
              <Link href={task.href} className={whiteButton}>
                Abrir
              </Link>
            )
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {focusing ? (
                <>
                  <button type="button" className={whiteButton} onClick={onDone}>
                    Concluí
                  </button>
                  {!finished && (
                    <button type="button" className={ghostButton} onClick={() => setPaused((p) => !p)}>
                      {paused ? "Continuar" : "Pausar"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="min-h-11 px-2 text-sm underline focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none"
                    onClick={stop}
                  >
                    Sair do foco
                  </button>
                </>
              ) : (
                <>
                  {MINUTES.map((minutes, index) => (
                    <button
                      key={minutes}
                      type="button"
                      className={index === 0 ? whiteButton : ghostButton}
                      onClick={() => start(minutes)}
                    >
                      {index === 0 ? `Modo foco · ${minutes} min` : `${minutes} min`}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="min-h-11 px-2 text-sm underline focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none"
                    onClick={onDone}
                  >
                    Já fiz
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {focusing && (
          <ProgressRing
            value={1 - left / total}
            label={`Faltam ${clock(left)} de foco`}
            size={132}
            thickness={8}
            trackClassName="stroke-white/25"
            barClassName="stroke-sun-300"
          >
            <span className="text-2xl font-medium tabular-nums">{clock(left)}</span>
          </ProgressRing>
        )}
      </div>
    </Block>
  );
}
