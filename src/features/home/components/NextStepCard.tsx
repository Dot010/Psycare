"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { splitAppointments } from "@/features/appointments/logic";
import { useHealth } from "@/features/health/hooks/useHealth";
import { dosesForDay } from "@/features/health/logic";
import { nextStep } from "@/features/home/logic";
import { nextUp } from "@/features/planner/logic";
import { usePlanner } from "@/features/planner/hooks/usePlanner";
import { toISODate } from "@/lib/dates";

/**
 * "Agora": uma coisa só para fazer, a mais importante do momento.
 * O resto do Início continua embaixo, mas quem chega num dia ruim não precisa escolher.
 */
export function NextStepCard({ checkedIn }: { checkedIn: boolean }) {
  const { appointments } = useAppointments();
  const { remedios, taken } = useHealth();
  const planner = usePlanner();
  const date = new Date();
  const today = toISODate(date);
  const now = date.toTimeString().slice(0, 5);

  const session = splitAppointments(appointments, `${today}T${now}`).upcoming.find(
    (a) => a.data === today && a.status === "confirmado",
  );
  const task = nextUp(planner.tasks, today, now);
  const step = nextStep({
    now,
    sessionToday: session && { hora: session.hora, profissional: session.profissional },
    pendingDoses: dosesForDay(remedios, today)
      .filter((dose) => !taken.includes(dose.key))
      .map((dose) => ({ nome: dose.nome, time: dose.time })),
    checkedIn,
    task: task && { title: task.title, time: task.time },
    hardDay: planner.hardToday,
  });

  return (
    <section
      aria-labelledby="next-step-title"
      className="rounded-3xl bg-brand-600 p-6 text-white md:p-8"
      suppressHydrationWarning
    >
      <p className="text-sm opacity-85">Agora</p>
      <h2 id="next-step-title" className="mt-1 text-2xl font-medium md:text-3xl" suppressHydrationWarning>
        {step.title}
      </h2>
      <p className="mt-1 text-base opacity-90" suppressHydrationWarning>
        {step.detail}
      </p>
      {step.href && step.action && (
        <Link
          href={step.href}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-brand-ink focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none"
        >
          {step.action}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}
