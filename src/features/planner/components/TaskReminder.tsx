"use client";

import { Bell, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGardenSound } from "@/features/garden/hooks/useGardenSound";
import { playChime } from "@/lib/sound";
import { dueTasks, reminderKey } from "../logic";
import { usePlanner } from "../hooks/usePlanner";
import type { Task } from "../types";

const CHECK_MS = 30_000;

/**
 * Avisa na tela, com um sininho se o som estiver ligado, quando chega a hora de uma tarefa.
 * Só funciona com o app aberto: avisos com o app fechado precisam de notificações do sistema.
 */
export function TaskReminder() {
  const { tasks, today } = usePlanner();
  const sound = useGardenSound();
  const announced = useRef(new Set<string>());
  const [notice, setNotice] = useState<Task | null>(null);
  const latest = useRef({ tasks, today, soundOn: sound.enabled });

  useEffect(() => {
    latest.current = { tasks, today, soundOn: sound.enabled };
  });

  useEffect(() => {
    const check = () => {
      const { tasks: list, today: day, soundOn } = latest.current;
      const now = new Date().toTimeString().slice(0, 5);
      const [first] = dueTasks(list, day, now, announced.current);
      if (!first) return;
      announced.current.add(reminderKey(day, first));
      setNotice(first);
      if (soundOn) playChime();
    };
    check();
    const id = setInterval(check, CHECK_MS);
    return () => clearInterval(id);
  }, []);

  if (!notice) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 top-4 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-sun-300 bg-sun-100 p-3 shadow-lg"
    >
      <Bell className="size-5 shrink-0 text-ink" aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-medium text-ink">
        Agora, {notice.time}: {notice.title}
      </p>
      <Link href="/dashboard/planner" className="text-sm font-semibold text-brand-ink underline">
        Meu dia
      </Link>
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={() => setNotice(null)}
        className="flex size-8 items-center justify-center rounded-full hover:bg-sun-200"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
