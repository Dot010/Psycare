"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { WheelChart } from "@/features/activities/components/WheelChart";
import { ACTIVITIES } from "@/features/activities/catalog";
import { compareWheel, formatDay, previousOfKind, recordSummary } from "@/features/activities/logic";
import type { ActivityRecord } from "@/features/activities/types";
import { intensityLabel } from "@/features/health/logic";
import { ProReferralBox } from "@/features/referral/components/ProReferralBox";
import { WeekChart } from "@/features/mood/components/WeekChart";
import { formatDateBR } from "@/lib/format";
import { patientById } from "../data";
import { usePro } from "../hooks/usePro";
import { moodTrend, sevenDays, trendSentence } from "../logic";
import { AssignDialog } from "./AssignDialog";
import { Prontuario } from "./Prontuario";
import { useProIdentity } from "./ProIdentity";

function NotShared({ what }: { what: string }) {
  return <p className="text-base text-muted-foreground">{what} não está compartilhado por este paciente.</p>;
}

function ActivityItem({ record, all }: { record: ActivityRecord; all: ActivityRecord[] }) {
  const info = ACTIVITIES[record.kind];
  const summary = recordSummary(record);
  return (
    <li className="border-t border-sunken py-3 first:border-t-0">
      <details>
        <summary className="cursor-pointer list-none">
          <span className="text-lg font-medium text-foreground">{info.title}</span>
          <span className="block text-sm text-muted-foreground">
            {formatDay(record.date)}
            {summary ? ` · ${summary}` : ""}
          </span>
        </summary>
        <div className="mt-3 space-y-3">
          {record.kind === "wheel" ? (
            <WheelChart
              rows={compareWheel(record, previousOfKind(all, record))}
              label={`Roda da vida de ${formatDay(record.date)}`}
            />
          ) : (
            <dl className="space-y-2">
              {info.fields
                .filter((f) => record.answers[f.id] !== undefined)
                .map((f) => (
                  <div key={f.id}>
                    <dt className="text-sm text-muted-foreground">{f.label}</dt>
                    <dd className="text-base whitespace-pre-wrap text-foreground">
                      {Array.isArray(record.answers[f.id])
                        ? (record.answers[f.id] as string[]).join(", ")
                        : String(record.answers[f.id])}
                    </dd>
                  </div>
                ))}
            </dl>
          )}
          {record.note && <p className="text-sm text-foreground">Anotação do paciente: “{record.note}”</p>}
        </div>
      </details>
    </li>
  );
}

export default function PatientDetail({ id }: { id: string }) {
  const patient = patientById(id);
  const pro = usePro();
  const me = useProIdentity();
  const [assignOpen, setAssignOpen] = useState(false);

  if (!patient) notFound();

  const snap = pro.snapshotOf(id);
  const trend = moodTrend(snap, pro.today);
  const first = patient.name.split(" ")[0];
  const assigned = pro.assigned.filter((a) => a.patientId === id);

  return (
    <Page
      title={patient.name}
      kicker={
        <Link href="/dashboard/pro/patients" className="hover:underline">
          ← Pacientes
        </Link>
      }
      description={`${patient.age} anos · acompanha desde ${formatDateBR(patient.since)}`}
      width="wide"
      actions={<Button onClick={() => setAssignOpen(true)}>Pedir atividade</Button>}
    >
      <PageColumns
        aside={
          <>
            <Block title="Para conversar na sessão">
              {snap?.topics ? (
                snap.topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nada marcado por enquanto.</p>
                ) : (
                  <ul>
                    {snap.topics.map((t) => (
                      <li
                        key={t.date + t.title}
                        className="border-t border-sunken py-2 text-sm first:border-t-0"
                      >
                        <span className="block text-xs text-muted-foreground">{formatDateBR(t.date)}</span>
                        {t.title}
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <NotShared what="O diário" />
              )}
              {snap?.topics && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Só o título do que o paciente marcou, nunca o texto do diário.
                </p>
              )}
            </Block>

            <Block title="Humor">
              {snap?.moodDays ? (
                <>
                  <WeekChart days={sevenDays(snap, pro.today)} />
                  <p className="mt-3 text-sm">{trendSentence(trend)}</p>
                </>
              ) : (
                <NotShared what="O humor" />
              )}
            </Block>

            {me.specialty === "psychologist" && (
              <Block title="Encaminhamento">
                <ProReferralBox patientId={id} firstName={first} />
              </Block>
            )}

            <Block tone="sand">
              <p className="text-sm text-muted-foreground">
                Você vê só o que {first} escolheu compartilhar. O que está desligado não aparece aqui.
              </p>
            </Block>
          </>
        }
      >
        <Prontuario patientId={id} firstName={first} />

        <Block title="Atividades">
          {snap?.activities ? (
            snap.activities.length === 0 ? (
              <p className="text-base text-muted-foreground">Nenhuma atividade feita ainda.</p>
            ) : (
              <ul>
                {snap.activities.map((r) => (
                  <ActivityItem key={r.id} record={r} all={snap.activities ?? []} />
                ))}
              </ul>
            )
          ) : (
            <NotShared what="As atividades" />
          )}
          {assigned.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-semibold">Pedidas por você</h3>
              <ul>
                {assigned.map((a) => (
                  <li key={a.id} className="border-t border-sunken py-2 text-base first:border-t-0">
                    {ACTIVITIES[a.kind].title}
                    <span className="block text-sm text-muted-foreground">
                      em {formatDay(a.assignedAt)}
                      {a.dueDate ? ` · para ${formatDay(a.dueDate)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Block>

        <Block title="Saúde">
          {snap?.symptoms || snap?.meds ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Sintomas (30 dias)</h3>
                {snap.symptoms && snap.symptoms.length > 0 ? (
                  <ul>
                    {snap.symptoms.map((s) => (
                      <li key={s.nome} className="border-t border-sunken py-2 text-base first:border-t-0">
                        {s.nome}
                        <span className="block text-sm text-muted-foreground">
                          {s.vezes} {s.vezes === 1 ? "vez" : "vezes"}
                          {s.media !== null
                            ? ` · intensidade média ${String(s.media).replace(".", ",")} de 5 (${intensityLabel(Math.round(s.media))})`
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base text-muted-foreground">Nenhum sintoma registrado.</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold">Remédios e doses (7 dias)</h3>
                {snap.meds && snap.meds.length > 0 ? (
                  <ul>
                    {snap.meds.map((m) => (
                      <li key={m.nome} className="border-t border-sunken py-2 text-base first:border-t-0">
                        {m.nome} <span className="text-muted-foreground">{m.dosagem}</span>
                        <span className="block text-sm text-muted-foreground">
                          {m.horarios} · {m.taken} de {m.planned} doses marcadas
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base text-muted-foreground">Nenhum remédio cadastrado.</p>
                )}
              </div>
            </div>
          ) : (
            <NotShared what="A saúde (remédios, doses e sintomas)" />
          )}
        </Block>
      </PageColumns>

      <AssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        patientId={id}
        onAssign={(pid, kind, due, msg) => pro.assign(pid, kind, due, msg, me.name)}
      />
    </Page>
  );
}
