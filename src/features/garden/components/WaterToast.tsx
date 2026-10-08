"use client";

import { Droplets } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WATER_EARNED_EVENT } from "@/features/garden/water";
import type { WaterSource } from "@/features/garden/types";

const LABELS: Record<WaterSource, string> = {
  checkin: "Check-in feito",
  habit: "Hábito concluído",
  diary: "Registro no diário",
  breathing: "Respiração concluída",
  mission: "Missão cumprida",
};

/** Aviso "+1 gota no regador" em qualquer tela, quando uma ação de cuidado enche o regador. */
export function WaterToast() {
  const [source, setSource] = useState<WaterSource | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onEarned = (event: Event) => {
      setSource((event as CustomEvent<{ source: WaterSource }>).detail.source);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setSource(null), 4500);
    };
    window.addEventListener(WATER_EARNED_EVENT, onEarned);
    return () => {
      window.removeEventListener(WATER_EARNED_EVENT, onEarned);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!source) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-12 z-50 flex justify-center px-4">
      <div
        role="status"
        className="animate-enter pointer-events-auto flex items-center gap-3 rounded-full bg-strong py-2 pr-4 pl-3 text-sm text-white shadow-lg"
      >
        <Droplets className="size-4 text-sky-300" aria-hidden />
        <span>
          <strong className="font-semibold">+1 gota no regador.</strong> {LABELS[source]}.
        </span>
        <Link
          href="/dashboard/home"
          className="font-semibold text-sun-300 underline-offset-4 hover:underline"
        >
          Regar
        </Link>
      </div>
    </div>
  );
}
