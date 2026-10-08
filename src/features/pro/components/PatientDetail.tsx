"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { WheelChart } from "@/features/activities/components/WheelChart";
import { ACTIVITIES } from "@/features/activities/catalog";
import { compareWheel, formatDay, previousOfKind, recordSummary } from "@/features/activities/logic";
import type { ActivityRecord } from "@/features/activities/types";
import { intensityLabel } from "@/features/health/logic";
import { WeekChart } from "@/features/mood/components/WeekChart";
import { formatDateBR } from "@/lib/format";
import { patientById } from "../data";
import { usePro } from "../hooks/usePro";
import { moodTrend, sevenDays, trendSentence } from "../logic";
import { AssignDialog } from "./AssignDialog";
import { useProIdentity } from "./ProIdentity";

const h2 = "text-2xl font-semibold text-brand-ink";
const section = "space-y-3 border-t border-border pt-8";

function NotShared({ what }: { what: string }) {
  return <p className="text-base text-muted-foreground">{what} não está compartilhado por este paciente.</p>;
}

function ActivityItem({ record, all }: { record: ActivityRecord; all: ActivityRecord[] }) {
  const info = ACTIVITIES[record.kind];
  const summary = recordSummary(record);
  return (
    <li className="border-t border-border py-3">
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
  const [noteText, setNoteText] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  if (!patient) notFound();

  const snap = pro.snapshotOf(id);
  const trend = moodTrend(snap, pro.today);
  const notes = pro.notes.filter((n) => n.patientId === id);
  const assigned = pro.assigned.filter((a) => a.patientId === id);

  return (
    <Page
      title={patient.name}
      description={`${patient.age} anos · acompanha desde ${formatDateBR(patient.since)}`}
      width="narrow"
      className="space-y-10"
      actions={<Button onClick={() => setAssignOpen(true)}>Pedir atividade</Button>}
    >
      <Link
        href="/dashboard/pro/patients"
        className="-mt-6 text-sm font-semibold text-brand-ink hover:underline"
      >
        ← Pacientes
      </Link>
      <p className="max-w-prose text-sm text-muted-foreground">
        Você vê só o que {patient.name.split(" ")[0]} escolheu compartilhar. O que está desligado não aparece
        aqui.
      </p>

      <section aria-labelledby="mood-title" className="space-y-3">
        <h2 id="mood-title" className={h2}>
          Humor
        </h2>
        {snap?.moodDays ? (
          <>
            <WeekChart days={sevenDays(snap, pro.today)} />
            <p className="text-base text-foreground">{trendSentence(trend)}</p>
          </>
        ) : (
          <NotShared what="O humor" />
        )}
      </section>

      <section aria-labelledby="topics-title" className={section}>
        <h2 id="topics-title" className={h2}>
          Para conversar na sessão
        </h2>
        {snap?.topics ? (
          snap.topics.length === 0 ? (
            <p className="text-base text-muted-foreground">Nada marcado por enquanto.</p>
          ) : (
            <ul>
              {snap.topics.map((t) => (
                <li key={t.date + t.title} className="border-t border-border py-2 text-base text-foreground">
                  <span className="mr-3 text-sm text-muted-foreground">{formatDateBR(t.date)}</span>
                  {t.title}
                </li>
              ))}
            </ul>
          )
        ) : (
          <NotShared what="O diário" />
        )}
        {snap?.topics && (
          <p className="text-xs text-muted-foreground">
            Só aparece o título do que o paciente marcou para levar à consulta, nunca o texto do diário.
          </p>
        )}
      </section>

      <section aria-labelledby="act-title" className={section}>
        <h2 id="act-title" className={h2}>
          Atividades
        </h2>
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
          <div className="pt-2">
            <h3 className="text-base font-semibold text-foreground">Pedidas por você</h3>
            <ul>
              {assigned.map((a) => (
                <li key={a.id} className="border-t border-border py-2 text-base text-foreground">
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
      </section>

      <section aria-labelledby="health-title" className={section}>
        <h2 id="health-title" className={h2}>
          Saúde
        </h2>
        {snap?.symptoms || snap?.meds ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Sintomas (30 dias)</h3>
              {snap.symptoms && snap.symptoms.length > 0 ? (
                <ul>
                  {snap.symptoms.map((s) => (
                    <li key={s.nome} className="border-t border-border py-2 text-base text-foreground">
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
              <h3 className="text-base font-semibold text-foreground">Remédios e doses (7 dias)</h3>
              {snap.meds && snap.meds.length > 0 ? (
                <ul>
                  {snap.meds.map((m) => (
                    <li key={m.nome} className="border-t border-border py-2 text-base text-foreground">
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
      </section>

      <section aria-labelledby="notes-title" className={section}>
        <h2 id="notes-title" className={h2}>
          Suas notas de sessão
        </h2>
        <p className="text-sm text-muted-foreground">Privadas: só você vê. O paciente nunca tem acesso.</p>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            pro.addNote(id, noteText);
            setNoteText("");
          }}
        >
          <label htmlFor="note-text" className="sr-only">
            Nova nota
          </label>
          <textarea
            id="note-text"
            rows={3}
            maxLength={2000}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-base"
            placeholder="Anote o que quiser lembrar desta sessão"
          />
          <Button type="submit" disabled={!noteText.trim()}>
            Guardar nota
          </Button>
        </form>
        <ul>
          {notes.map((n) => (
            <li key={n.id} className="flex items-start justify-between gap-3 border-t border-border py-3">
              <div>
                <p className="text-sm text-muted-foreground">{formatDateBR(n.date)}</p>
                <p className="text-base whitespace-pre-wrap text-foreground">{n.text}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => pro.removeNote(n.id)}>
                Apagar
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <AssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        patientId={id}
        onAssign={(pid, kind, due, msg) => pro.assign(pid, kind, due, msg, me.name)}
      />
    </Page>
  );
}
