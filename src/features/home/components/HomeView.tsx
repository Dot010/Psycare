"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { TiltCard } from "@/components/motion/TiltCard";
import { NextSessionCard } from "@/features/appointments/components/NextSessionCard";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { splitAppointments } from "@/features/appointments/logic";
import { useDiary } from "@/features/diary/hooks/useDiary";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { toISODate } from "@/lib/dates";
import { mockUser } from "@/mocks/user";

export default function HomeView() {
  const { habits } = useHabits();
  const { appointments } = useAppointments();
  const { entries } = useDiary();

  const now = new Date();
  const { past } = splitAppointments(appointments, `${toISODate(now)}T${now.toTimeString().slice(0, 5)}`);
  const stats = [
    { label: "Hábitos ativos", value: habits.length, hint: "Rotinas acompanhadas diariamente." },
    {
      label: "Consultas realizadas",
      value: past.filter((item) => item.status !== "cancelado").length,
      hint: "Histórico consolidado no seu painel.",
    },
    {
      label: "Entradas no diário",
      value: entries.length,
      hint: "Registros para acompanhar emoção e progresso.",
    },
  ];

  return (
    <Page
      title={`Bem-vindo(a), ${mockUser.name}`}
      description="Aqui está um resumo rápido da sua jornada de cuidado nesta semana."
      width="wide"
    >
      <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <TiltCard key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="mt-2 text-3xl font-bold text-primary">{stat.value}</dd>
            <dd className="mt-1 text-sm text-muted-foreground">{stat.hint}</dd>
          </TiltCard>
        ))}
      </dl>

      <TiltCard>
        <NextSessionCard />
      </TiltCard>

      <Link
        href="/dashboard/breathing"
        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
      >
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Um minuto para respirar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Exercício guiado para desacelerar, com técnicas de 1 a 5 minutos.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
          Começar <ArrowRight className="size-4" />
        </span>
      </Link>
    </Page>
  );
}
