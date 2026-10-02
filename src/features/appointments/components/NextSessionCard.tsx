"use client";

import type { ReactNode } from "react";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { nextAppointment } from "@/features/appointments/logic";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";

interface NextSessionCardProps {
  /** Botão ou link opcional exibido abaixo dos dados. */
  action?: ReactNode;
}

export function NextSessionCard({ action }: NextSessionCardProps) {
  const { appointments } = useAppointments();
  const now = new Date();
  const next = nextAppointment(appointments, `${toISODate(now)}T${now.toTimeString().slice(0, 5)}`);

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-brand-accent">Próxima sessão</h2>
      {next ? (
        <dl className="mt-3 space-y-1 text-foreground/90">
          <div className="flex gap-1.5">
            <dt className="font-semibold">Profissional:</dt>
            <dd>{next.profissional}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-semibold">Quando:</dt>
            <dd>
              {formatDateBR(next.data)} às {next.hora} · {next.tipo === "online" ? "Online" : "Presencial"}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Nenhuma sessão agendada no momento.</p>
      )}
      {next && action && <div className="mt-4">{action}</div>}
    </section>
  );
}
