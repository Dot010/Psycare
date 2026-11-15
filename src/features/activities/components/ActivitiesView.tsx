"use client";

import Link from "next/link";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { CountUp } from "@/components/motion/CountUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { ACTIVITIES, ACTIVITY_KINDS } from "../catalog";
import { useActivities } from "../hooks/useActivities";
import {
  dueLabel,
  formatDay,
  newestFirst,
  pendingAssignments,
  recordSummary,
  suggestsRedo,
  thermometerSentence,
} from "../logic";
import type { ActivityKind, ActivityRecord } from "../types";
import { ActivityForm } from "./ActivityForm";
import { RecordDetail } from "./RecordDetail";

type Mode =
  | { name: "list" }
  | { name: "new"; kind: ActivityKind; assignmentId?: string }
  | { name: "view"; id: string };

const tile =
  "animate-pop-in flex min-h-20 flex-col items-start justify-between gap-1 rounded-2xl border border-border bg-canvas p-3 text-left text-foreground transition-colors hover:border-brand-600 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

export default function ActivitiesView() {
  const { records, assignments, saveRecord, removeRecord } = useActivities();
  const [mode, setMode] = useState<Mode>({ name: "list" });
  const today = toISODate(new Date());

  const ordered = newestFirst(records);
  const pending = pendingAssignments(assignments);

  if (mode.name === "new") {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 md:p-8">
        <ActivityForm
          key={mode.kind + (mode.assignmentId ?? "")}
          kind={mode.kind}
          onCancel={() => setMode({ name: "list" })}
          onSave={(answers, note) => {
            const record = saveRecord(mode.kind, answers, note, mode.assignmentId);
            setMode({ name: "view", id: record.id });
          }}
        />
      </div>
    );
  }

  if (mode.name === "view") {
    const record = records.find((item) => item.id === mode.id);
    if (record) {
      return (
        <div className="mx-auto w-full max-w-2xl p-4 md:p-8">
          <RecordDetail
            record={record}
            all={records}
            onBack={() => setMode({ name: "list" })}
            onRedo={() => setMode({ name: "new", kind: record.kind })}
            onDelete={() => {
              removeRecord(record.id);
              setMode({ name: "list" });
            }}
          />
        </div>
      );
    }
  }

  const assignedDone = assignments.length - pending.length;
  const thermometers = ordered.filter(
    (r) =>
      r.kind === "thermometer" && typeof r.answers.before === "number" && typeof r.answers.after === "number",
  );

  return (
    <Page
      title="O que te pediram"
      kicker="Atividades"
      description="Feito pela metade também conta. Tudo fica guardado para rever quando quiser."
      width="wide"
    >
      <PageColumns
        aside={
          <>
            {assignments.length > 0 && (
              <Block label="Pedidos feitos">
                <div className="flex items-center gap-4">
                  <ProgressRing
                    value={assignedDone / assignments.length}
                    label={`${assignedDone} de ${assignments.length} pedidos feitos`}
                    size={84}
                  >
                    <span className="text-lg font-semibold">
                      <CountUp value={assignedDone} />/{assignments.length}
                    </span>
                  </ProgressRing>
                  <p className="text-sm leading-relaxed">
                    {pending.length === 0
                      ? "Você fez tudo o que foi pedido."
                      : `${assignedDone} de ${assignments.length} pedidos feitos.`}
                  </p>
                </div>
              </Block>
            )}

            <Block title="Por conta própria">
              <p className="-mt-2 mb-3 text-sm text-muted-foreground">Tudo opcional, sem prazo.</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard/breathing" className={tile} style={{ animationDelay: "200ms" }}>
                  <span className="text-sm font-medium">Respirar um minuto</span>
                  <span className="text-xs text-muted-foreground">1 a 5 minutos</span>
                </Link>
                {ACTIVITY_KINDS.map((kind, index) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setMode({ name: "new", kind })}
                    className={tile}
                    style={{ animationDelay: `${260 + index * 60}ms` }}
                  >
                    <span className="text-sm font-medium">{ACTIVITIES[kind].title}</span>
                  </button>
                ))}
              </div>
            </Block>
          </>
        }
      >
        <Block tone="soft" size="lg" title="Pedidas pelos seus profissionais">
          {pending.length === 0 ? (
            <p className="text-base text-muted-foreground">
              Nada pendente. Quando seu profissional pedir uma atividade, ela aparece aqui.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {pending.map((item) => {
                const due = dueLabel(item.dueDate, today);
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold">{ACTIVITIES[item.kind].title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Pedida por {item.by} em {formatDay(item.assignedAt)}
                      </p>
                      {item.message && <p className="text-sm leading-relaxed">“{item.message}”</p>}
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                      {due ? (
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            due.late ? "bg-sunken text-ink" : "bg-sun-100 text-sun-700",
                          )}
                        >
                          {due.text}
                        </span>
                      ) : (
                        <span />
                      )}
                      <Button
                        className="min-h-11"
                        aria-label={`Fazer ${ACTIVITIES[item.kind].title}`}
                        onClick={() => setMode({ name: "new", kind: item.kind, assignmentId: item.id })}
                      >
                        Fazer
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Block>

        {ordered.length > 0 && (
          <Block title="O que você já fez" size="lg">
            {thermometers.length > 0 && <ThermometerBars record={thermometers[0]} />}
            <ul>
              {ordered.map((record) => {
                const summary = recordSummary(record);
                const redo = suggestsRedo(record, today);
                return (
                  <li key={record.id} className="border-t border-sunken py-3 first:border-t-0">
                    <button
                      type="button"
                      onClick={() => setMode({ name: "view", id: record.id })}
                      className="flex w-full flex-col gap-0.5 text-left hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                    >
                      <span className="text-base font-medium">{ACTIVITIES[record.kind].title}</span>
                      <span className="text-sm text-muted-foreground">
                        Feita em {formatDay(record.date)}
                        {summary ? ` · ${summary}` : ""}
                      </span>
                    </button>
                    {redo && (
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-sun-700">
                        Já faz um mês. Quer refazer e ver o que mudou?
                        <button
                          type="button"
                          onClick={() => setMode({ name: "new", kind: record.kind })}
                          className="min-h-11 font-semibold text-brand-ink underline-offset-2 hover:underline"
                        >
                          Refazer
                        </button>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Block>
        )}
      </PageColumns>
    </Page>
  );
}

/** O último termômetro, em duas barras: quanto pesava antes e depois. */
function ThermometerBars({ record }: { record: ActivityRecord }) {
  const before = record.answers.before as number;
  const after = record.answers.after as number;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-6 rounded-2xl bg-canvas p-4">
      <div className="min-w-0 flex-1 basis-48 space-y-1">
        <p className="text-sm font-semibold">Termômetro emocional · {formatDay(record.date)}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{thermometerSentence(record.answers)}</p>
      </div>
      <div
        role="img"
        aria-label={`Quanto pesava: antes ${before}, depois ${after}, de 10`}
        className="flex h-24 items-end gap-4"
      >
        {[
          { label: "antes", value: before, color: "bg-taupe" },
          { label: "depois", value: after, color: "bg-primary" },
        ].map((bar, index) => (
          <div key={bar.label} className="flex h-full flex-col items-center justify-end gap-1">
            <span
              className={cn("animate-grow-up w-10 rounded-xl", bar.color)}
              style={{ height: `${Math.max(6, bar.value * 10)}%`, animationDelay: `${index * 150}ms` }}
            />
            <span className="text-xs text-muted-foreground" aria-hidden>
              {bar.label} {bar.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
