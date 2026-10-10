"use client";

import Link from "next/link";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { toISODate } from "@/lib/dates";
import { ACTIVITIES, ACTIVITY_KINDS } from "../catalog";
import { useActivities } from "../hooks/useActivities";
import { formatDay, newestFirst, pendingAssignments, recordSummary, suggestsRedo } from "../logic";
import type { ActivityKind } from "../types";
import { ActivityForm } from "./ActivityForm";
import { RecordDetail } from "./RecordDetail";

type Mode =
  | { name: "list" }
  | { name: "new"; kind: ActivityKind; assignmentId?: string }
  | { name: "view"; id: string };

const rowClass =
  "flex w-full items-center justify-between gap-3 border-t border-border py-3 text-left transition-colors hover:text-brand-ink focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none";

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

  return (
    <Page
      title="Atividades"
      description="O que seu profissional pediu e o que você já fez, guardado para rever quando quiser."
      width="narrow"
    >
      {pending.length > 0 && (
        <section aria-labelledby="todo-title" className="space-y-1">
          <h2 id="todo-title" className="mb-2 text-2xl font-semibold text-brand-ink">
            Para fazer
          </h2>
          {pending.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode({ name: "new", kind: item.kind, assignmentId: item.id })}
              className={rowClass}
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-lg font-medium text-foreground">{ACTIVITIES[item.kind].title}</span>
                <span className="text-sm text-muted-foreground">
                  Pedida por {item.by} em {formatDay(item.assignedAt)}
                  {item.dueDate ? ` · para ${formatDay(item.dueDate)}` : ""}
                </span>
                {item.message && <span className="text-sm text-foreground">“{item.message}”</span>}
              </span>
              <span className="text-sm font-semibold whitespace-nowrap text-brand-ink">Fazer →</span>
            </button>
          ))}
        </section>
      )}

      {ordered.length > 0 && (
        <section aria-labelledby="done-title" className="space-y-1">
          <h2 id="done-title" className="mb-2 text-2xl font-semibold text-brand-ink">
            Feitas
          </h2>
          {ordered.map((record) => {
            const summary = recordSummary(record);
            const redo = suggestsRedo(record, today);
            return (
              <div key={record.id} className="border-t border-border py-3">
                <button
                  type="button"
                  onClick={() => setMode({ name: "view", id: record.id })}
                  className="flex w-full flex-col gap-0.5 text-left focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                >
                  <span className="text-lg font-medium text-foreground">{ACTIVITIES[record.kind].title}</span>
                  <span className="text-sm text-muted-foreground">
                    Feita em {formatDay(record.date)}
                    {summary ? ` · ${summary}` : ""}
                  </span>
                </button>
                {redo && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-sun-800">
                    Já faz um mês. Quer refazer e ver o que mudou?
                    <button
                      type="button"
                      onClick={() => setMode({ name: "new", kind: record.kind })}
                      className="font-semibold text-brand-ink underline-offset-2 hover:underline"
                    >
                      Refazer
                    </button>
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      <section aria-labelledby="own-title" className="space-y-1">
        <h2 id="own-title" className="text-2xl font-semibold text-brand-ink">
          Começar por conta própria
        </h2>
        <p className="mb-2 text-sm text-muted-foreground">Tudo opcional, sem prazo.</p>
        <Link href="/dashboard/breathing" className={rowClass}>
          <span className="flex flex-col gap-0.5">
            <span className="text-base text-foreground">Respirar um minuto</span>
            <span className="text-sm text-muted-foreground">Exercício guiado de 1 a 5 minutos.</span>
          </span>
          <span aria-hidden className="text-muted-foreground">
            →
          </span>
        </Link>
        {ACTIVITY_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => setMode({ name: "new", kind })}
            className={rowClass}
          >
            <span className="text-base text-foreground">{ACTIVITIES[kind].title}</span>
            <span aria-hidden className="text-muted-foreground">
              →
            </span>
          </button>
        ))}
      </section>
    </Page>
  );
}
