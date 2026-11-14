"use client";

import Link from "next/link";
import { CountUp } from "@/components/motion/CountUp";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { splitAppointments } from "@/features/appointments/logic";
import { useDiary } from "@/features/diary/hooks/useDiary";
import { entriesForSession, weekdayShort } from "@/features/home/logic";
import { daysBetween, toISODate } from "@/lib/dates";

/** O bloco amarelo do Início: quanto falta para a próxima sessão e o que levar. */
export function SessionMini() {
  const { appointments } = useAppointments();
  const { entries } = useDiary();
  const now = new Date();
  const today = toISODate(now);
  const { upcoming, past } = splitAppointments(appointments, `${today}T${now.toTimeString().slice(0, 5)}`);
  const next = upcoming[0];
  const days = next ? daysBetween(today, next.data) : 0;
  const toTake = entriesForSession(entries, past[0]?.data);

  return (
    <section aria-labelledby="session-title" className="rounded-3xl bg-sun-300 p-6 text-ink">
      <h2 id="session-title" className="text-base font-medium">
        Próxima sessão
      </h2>
      {next ? (
        <>
          <p className="mt-3 flex items-baseline gap-2">
            {days === 0 ? (
              <span className="text-5xl leading-none font-light tracking-tight">Hoje</span>
            ) : (
              <>
                <CountUp value={days} className="text-6xl leading-none font-light tracking-tight" />
                <span className="text-base">{days === 1 ? "dia" : "dias"}</span>
              </>
            )}
          </p>
          <p className="mt-3 text-sm">
            {weekdayShort(next.data)} · {next.hora} · {next.tipo === "online" ? "online" : "presencial"}
            <br />
            {next.profissional}
          </p>
          {toTake > 0 && (
            <p className="mt-3 text-sm">
              Você vai levar {toTake} {toTake === 1 ? "registro" : "registros"} do diário.
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm">Nenhuma sessão marcada.</p>
      )}
      <Link
        href="/dashboard/appointments"
        className="mt-2 inline-flex min-h-11 items-center text-sm underline"
      >
        {next ? "Ver agenda" : "Marcar uma sessão"}
      </Link>
    </section>
  );
}
