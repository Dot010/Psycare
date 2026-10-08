"use client";

import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { formatDateBR } from "@/lib/format";
import { daysSinceLastMood, moodTrend, trendSentence } from "../logic";
import { LIVE_PATIENT_ID, patientById } from "../data";
import { usePro } from "../hooks/usePro";
import { SessionLine } from "./SessionLine";

const h2 = "text-2xl font-semibold text-brand-ink";

function todayLabel(): string {
  const text = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function ProDashboard() {
  const pro = usePro();
  const todays = pro.sessions
    .filter((s) => s.data === pro.today && s.status !== "cancelado")
    .sort((a, b) => a.hora.localeCompare(b.hora));

  // Quem merece um olhar: humor mais baixo que na semana anterior ou alguns dias sem registrar.
  const watch = pro.patients.flatMap((patient) => {
    const snap = pro.snapshotOf(patient.id);
    const trend = moodTrend(snap, pro.today);
    const silent = daysSinceLastMood(snap, pro.today);
    const reasons: string[] = [];
    if (trend?.delta !== null && trend && trend.delta <= -0.7) reasons.push(trendSentence(trend));
    if (silent !== null && silent >= 3) reasons.push(`Sem registrar o humor há ${silent} dias.`);
    return reasons.length ? [{ patient, reasons }] : [];
  });

  return (
    <Page title="Painel do dia" description={todayLabel()} width="narrow" className="space-y-10">
      <DemoNotice>
        Pacientes e sessões são fictícios. O paciente de demonstração usa os dados deste navegador.
      </DemoNotice>

      <section aria-labelledby="today-title" className="space-y-2">
        <h2 id="today-title" className={h2}>
          {todays.length === 0
            ? "Nenhuma sessão hoje."
            : `${todays.length} ${todays.length === 1 ? "sessão" : "sessões"} hoje`}
        </h2>
        {todays.length > 0 && (
          <ul>
            {todays.map((s) => (
              <SessionLine
                key={s.id}
                session={s}
                actions={
                  s.status === "pendente" ? (
                    <Button size="sm" onClick={() => pro.setSessionStatus(s.id, "confirmado")}>
                      Confirmar
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/pro/patients/${s.patientId}`}>Abrir paciente</Link>
                    </Button>
                  )
                }
              />
            ))}
          </ul>
        )}
      </section>

      {pro.patientRequests.length > 0 && (
        <section aria-labelledby="req-title" className="space-y-2 border-t border-border pt-8">
          <h2 id="req-title" className={h2}>
            Pedidos de consulta
          </h2>
          <ul>
            {pro.patientRequests.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3"
              >
                <div>
                  <p className="text-lg font-medium text-foreground">{patientById(LIVE_PATIENT_ID)?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateBR(r.data)} às {r.hora} · {r.tipo === "online" ? "Online" : "Presencial"}
                    {r.observacao ? ` · “${r.observacao}”` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => pro.answerRequest(r.id, "confirmado")}>
                    Confirmar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => pro.answerRequest(r.id, "cancelado")}>
                    Recusar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="watch-title" className="space-y-2 border-t border-border pt-8">
        <h2 id="watch-title" className={h2}>
          Vale olhar com calma
        </h2>
        {watch.length === 0 ? (
          <p className="text-base text-muted-foreground">
            Nada fora do esperado nos registros compartilhados.
          </p>
        ) : (
          <ul>
            {watch.map(({ patient, reasons }) => (
              <li key={patient.id} className="border-t border-border py-3">
                <Link
                  href={`/dashboard/pro/patients/${patient.id}`}
                  className="text-lg font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {patient.name}
                </Link>
                {reasons.map((reason) => (
                  <p key={reason} className="text-sm text-muted-foreground">
                    {reason}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Só aparece o que o paciente escolheu compartilhar. Isto não é um alerta clínico.
        </p>
      </section>
    </Page>
  );
}
