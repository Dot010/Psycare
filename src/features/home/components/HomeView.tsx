"use client";

import { mockUser } from "@/data/mockData";
import { AnimatedText } from "@/components/motion/AnimatedText";
import Link from "next/link";
import { TiltCard } from "@/components/motion/TiltCard";

export default function HomeView() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <header className="space-y-2">
        <AnimatedText
          as="h2"
          text={`Bem-vindo(a), ${mockUser.name}`}
          className="text-2xl md:text-3xl font-bold font-heading text-foreground"
        />
        <p className="text-muted-foreground text-sm md:text-base">
          Aqui está um resumo rápido da sua jornada de cuidado nesta semana.
        </p>
      </header>

  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TiltCard className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Hábitos ativos
          </p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {mockUser.habits.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rotinas acompanhadas diariamente.
          </p>
        </TiltCard>

        <TiltCard className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Consultas realizadas
          </p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {mockUser.agendamentos.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Histórico consolidado no seu painel.
          </p>
        </TiltCard>

        <TiltCard className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Entradas no diário
          </p>
          <p className="mt-2 text-3xl font-bold text-primary">
            {mockUser.diaryEntries.length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registros para acompanhar emoção e progresso.
          </p>
        </TiltCard>
      </div>

      {/* Card de Destaque para a Próxima Sessão */}
      <TiltCard className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary font-heading">
          Próxima sessão
        </h2>
        <p className="mt-3 text-foreground/90">
          <strong>Profissional:</strong> {mockUser.nextSession.doctor}
        </p>
        <p className="text-foreground/90">
          <strong>Quando:</strong> {mockUser.nextSession.date} às {mockUser.nextSession.time}
        </p>
      </TiltCard>

      <Link
        href="/dashboard/breathing"
        className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
      >
        <div>
          <h2 className="text-lg font-semibold font-heading text-foreground">Um minuto para respirar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Exercício guiado para desacelerar, com técnicas de 1 a 5 minutos.
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-primary">Começar →</span>
      </Link>
    </div>
  );
}