"use client";

import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { Block } from "@/components/ui/block";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { countdown, nextAppointment } from "@/features/appointments/logic";
import { daysBetween, toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";

interface NextSessionCardProps {
  /** Botão ou link opcional exibido abaixo dos dados. */
  action?: ReactNode;
}

/** O cartão amarelo da próxima sessão, igual ao do Início: os dias que faltam em destaque. */
export function NextSessionCard({ action }: NextSessionCardProps) {
  const { appointments } = useAppointments();
  const now = new Date();
  const today = toISODate(now);
  const next = nextAppointment(appointments, `${today}T${now.toTimeString().slice(0, 5)}`);
  const days = next ? daysBetween(today, next.data) : 0;

  return (
    <Block tone="sun" title="Próxima sessão">
      {next ? (
        <div className="space-y-3">
          {days > 0 ? (
            <p className="flex items-baseline gap-2">
              <span className="text-5xl leading-none font-semibold tracking-tight">
                <CountUp value={days} />
              </span>
              <span className="text-base">{days === 1 ? "dia" : "dias"}</span>
            </p>
          ) : (
            <p className="text-3xl font-semibold tracking-tight">{countdown(next, now)}</p>
          )}
          <p className="text-sm leading-relaxed">
            {formatDateBR(next.data)} às {next.hora} · {next.tipo === "online" ? "online" : "presencial"}
            <br />
            {next.profissional}
          </p>
          {next.observacao && <p className="text-sm">Lembrar de: {next.observacao}</p>}
          {action}
        </div>
      ) : (
        <p className="text-sm">Nenhuma sessão agendada no momento.</p>
      )}
    </Block>
  );
}
