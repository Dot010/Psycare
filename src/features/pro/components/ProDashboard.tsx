"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { timeGreeting } from "@/features/home/logic";
import { formatCurrencyBRL, formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { closingLine, daysSinceLastMood, financeSummary, moodTrend, trendSentence } from "../logic";
import { LIVE_PATIENT_ID, patientById } from "../data";
import { usePro } from "../hooks/usePro";
import type { ProSession } from "../types";
import { ClinicalInbox } from "./ClinicalInbox";
import { CloseSession } from "./CloseSession";
import { useProIdentity } from "./ProIdentity";

const STATUS: Record<ProSession["status"], { label: string; className: string }> = {
  confirmado: { label: "Confirmada", className: "bg-sunken text-ink" },
  pendente: { label: "Aguardando", className: "bg-sun-100 text-sun-700" },
  cancelado: { label: "Cancelada", className: "bg-sunken text-muted-foreground" },
  realizada: { label: "Realizada", className: "bg-brand-100 text-brand-ink" },
  faltou: { label: "Faltou", className: "bg-danger-50 text-danger-600" },
};

function todayLabel(): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  );
}

/** "Dra. Helena Prado" → "Helena". */
function firstName(name: string): string {
  return name.replace(/^(Dra?\.)\s*/, "").split(" ")[0];
}

/**
 * Painel do dia do profissional, no mesmo layout do paciente.
 * À esquerda as sessões de hoje, cada uma com o "Encerrar sessão";
 * à direita a próxima sessão, os pedidos, quem vale olhar com calma e o mês.
 */
export default function ProDashboard({ specialty }: { specialty?: "psychiatrist" | "psychologist" }) {
  const pro = usePro();
  const me = useProIdentity();
  const noun = specialty === "psychiatrist" ? "consulta" : "sessão";
  const [closing, setClosing] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; patientId: string; rx?: boolean } | null>(null);

  const todays = pro.sessions
    .filter((s) => s.data === pro.today && s.status !== "cancelado")
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const closedCount = todays.filter((s) => s.status === "realizada" || s.status === "faltou").length;
  const next = todays.find((s) => s.status === "confirmado");
  const month = financeSummary(pro.sessions, pro.patients, pro.today, pro.closings);

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

  const plural = noun === "sessão" ? "sessões" : "consultas";
  const summary =
    todays.length === 0
      ? `Nenhuma ${noun} hoje.`
      : `${todays.length} ${todays.length === 1 ? noun : plural} hoje · ${
          closedCount === 0
            ? "nenhuma encerrada ainda"
            : closedCount === todays.length
              ? "todas encerradas"
              : `${closedCount} ${closedCount === 1 ? "encerrada" : "encerradas"}`
        }`;

  return (
    <Page
      title={timeGreeting(firstName(me.name), new Date().getHours())}
      kicker={todayLabel()}
      description={summary}
      width="wide"
    >
      <DemoNotice>
        Pacientes e sessões são fictícios. O paciente de demonstração usa os dados deste navegador.
      </DemoNotice>

      {notice && (
        <div
          role="status"
          className="animate-rise flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-100 px-5 py-3 text-brand-ink"
        >
          <span className="text-sm font-medium">{notice.text}</span>
          <span className="flex gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/dashboard/pro/patients/${notice.patientId}`}>Ver prontuário</Link>
            </Button>
            {notice.rx && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/pro/prescriptions">Registrar receita</Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/pro/finance">Ver financeiro</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setNotice(null)}>
              Fechar
            </Button>
          </span>
        </div>
      )}

      <PageColumns
        aside={
          <>
            <Block tone="sun" title={noun === "sessão" ? "Próxima sessão" : "Próxima consulta"}>
              {next ? (
                <div className="space-y-2">
                  <p className="flex items-baseline gap-2">
                    <span className="text-5xl leading-none font-semibold tracking-tight tabular-nums">
                      {next.hora}
                    </span>
                    <span className="text-sm">{next.tipo === "online" ? "online" : "presencial"}</span>
                  </p>
                  <p className="text-base font-medium">{patientById(next.patientId)?.name}</p>
                  <Link
                    href={`/dashboard/pro/patients/${next.patientId}`}
                    className="inline-flex min-h-11 items-center text-sm font-medium underline"
                  >
                    Abrir a ficha antes
                  </Link>
                </div>
              ) : (
                <p className="text-sm">Nada mais marcado para hoje.</p>
              )}
            </Block>

            {pro.patientRequests.length > 0 && (
              <Block title="Pedidos de consulta">
                <ul>
                  {pro.patientRequests.map((r) => (
                    <li key={r.id} className="space-y-2 border-t border-sunken py-3 first:border-t-0">
                      <div>
                        <p className="text-sm font-medium">{patientById(LIVE_PATIENT_ID)?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateBR(r.data)} às {r.hora} · {r.tipo === "online" ? "online" : "presencial"}
                          {r.observacao ? ` · “${r.observacao}”` : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => pro.answerRequest(r.id, "confirmado")}>
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => pro.answerRequest(r.id, "cancelado")}
                        >
                          Recusar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            <Block title="Vale olhar com calma">
              {watch.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nada fora do esperado nos registros compartilhados.
                </p>
              ) : (
                <ul>
                  {watch.map(({ patient, reasons }) => (
                    <li key={patient.id} className="border-t border-sunken py-2.5 first:border-t-0">
                      <Link
                        href={`/dashboard/pro/patients/${patient.id}`}
                        className="text-sm font-medium underline-offset-2 hover:underline"
                      >
                        {patient.name}
                      </Link>
                      {reasons.map((reason) => (
                        <p key={reason} className="text-xs text-muted-foreground">
                          {reason}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Só aparece o que o paciente escolheu compartilhar. Isto não é um alerta clínico.
              </p>
            </Block>

            <Block
              title="Este mês"
              aside={
                <Link href="/dashboard/pro/finance" className="underline">
                  Financeiro
                </Link>
              }
            >
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Recebido</dt>
                  <dd className="text-lg font-semibold">{formatCurrencyBRL(month.received)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">A receber</dt>
                  <dd className="text-lg font-semibold text-sun-700">{formatCurrencyBRL(month.toReceive)}</dd>
                </div>
              </dl>
            </Block>
          </>
        }
      >
        <Block
          title={noun === "sessão" ? "Sessões de hoje" : "Consultas de hoje"}
          size="lg"
          aside={todays.length > 0 ? `${closedCount} de ${todays.length} encerradas` : undefined}
        >
          {todays.length === 0 ? (
            <p className="text-base text-muted-foreground">Nada marcado para hoje.</p>
          ) : (
            <ul>
              {todays.map((s) => {
                const patient = patientById(s.patientId);
                const closed = pro.closings.find((c) => c.sessionId === s.id);
                const open = closing === s.id;
                return (
                  <li key={s.id} className="space-y-4 border-t border-sunken py-4 first:border-t-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="w-14 text-base font-medium tabular-nums">{s.hora}</span>
                      <div className="min-w-0 flex-1 basis-40">
                        <Link
                          href={`/dashboard/pro/patients/${s.patientId}`}
                          className="text-base font-medium underline-offset-2 hover:underline"
                        >
                          {patient?.name ?? "Paciente"}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {closed
                            ? closingLine(closed, formatCurrencyBRL)
                            : s.tipo === "online"
                              ? "Online"
                              : "Presencial"}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          STATUS[s.status].className,
                        )}
                      >
                        {STATUS[s.status].label}
                      </span>
                      {s.status === "pendente" && (
                        <Button size="sm" onClick={() => pro.setSessionStatus(s.id, "confirmado")}>
                          Confirmar
                        </Button>
                      )}
                      {s.status === "confirmado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          aria-expanded={open}
                          onClick={() => setClosing(open ? null : s.id)}
                        >
                          Encerrar {noun}
                        </Button>
                      )}
                    </div>

                    {open && patient && (
                      <div className="md:pl-18">
                        <CloseSession
                          patientName={patient.name}
                          fee={patient.fee}
                          today={pro.today}
                          noun={noun}
                          by={me.name}
                          onCancel={() => setClosing(null)}
                          onClose={(input) => {
                            const error = pro.closeSession(s, input);
                            if (error) return error;
                            const first = patient.name.split(" ")[0];
                            const charged = input.outcome === "realizada" || input.chargeMissed;
                            setNotice({
                              patientId: s.patientId,
                              rx:
                                input.outcome === "realizada" && !!input.conduct && input.conduct !== "none",
                              text: `${noun === "sessão" ? "Sessão" : "Consulta"} de ${first} encerrada. ${
                                input.outcome === "realizada" ? "A evolução" : "A falta"
                              } foi para o prontuário${charged ? " e a cobrança para o Financeiro" : ""}${
                                input.homework && input.outcome === "realizada"
                                  ? ". A tarefa já está em Atividades"
                                  : ""
                              }.`,
                            });
                            setClosing(null);
                            return null;
                          }}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Block>

        {specialty === "psychiatrist" && <ClinicalInbox />}
      </PageColumns>
    </Page>
  );
}
