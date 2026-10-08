"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { ACTIVITIES } from "../catalog";
import {
  compareWheel,
  formatDay,
  formatDayShort,
  previousOfKind,
  sleepAverage,
  thermometerSentence,
  wheelSentence,
} from "../logic";
import type { ActivityRecord } from "../types";
import { WheelChart } from "./WheelChart";

function Wheel({ record, all }: { record: ActivityRecord; all: ActivityRecord[] }) {
  const previous = previousOfKind(all, record);
  const rows = compareWheel(record, previous);
  const now = formatDayShort(record.date);
  const then = previous ? formatDayShort(previous.date) : null;
  const label = `Roda da vida de ${now}${then ? ` comparada com ${then}` : ""}. ${rows
    .map((r) => `${r.area} ${r.before !== null ? `de ${r.before} para ${r.now}` : r.now}`)
    .join(", ")}.`;
  return (
    <div className="space-y-6">
      <div className="-mx-4 sm:mx-0">
        <WheelChart rows={rows} label={label} />
      </div>
      {then && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-foreground">
          <span className="flex items-center gap-2">
            <svg width="26" height="8" aria-hidden>
              <line x1="0" y1="4" x2="26" y2="4" className="stroke-brand-600" strokeWidth={3} />
            </svg>
            {now}
          </span>
          <span className="flex items-center gap-2">
            <svg width="26" height="8" aria-hidden>
              <line
                x1="0"
                y1="4"
                x2="26"
                y2="4"
                className="stroke-sun-700"
                strokeWidth={2.5}
                strokeDasharray="6 5"
              />
            </svg>
            {then}
          </span>
        </div>
      )}
      <p className="text-xl leading-snug font-medium text-foreground">{wheelSentence(rows)}</p>
      <table className="w-full text-base">
        <caption className="sr-only">Nota de cada área</caption>
        <thead>
          <tr className="text-sm text-muted-foreground">
            <th scope="col" className="pb-1 text-left font-normal">
              Área
            </th>
            {then && (
              <th scope="col" className="pb-1 text-right font-normal">
                {then}
              </th>
            )}
            <th scope="col" className="pb-1 text-right font-normal">
              {now}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.area} className="border-t border-border">
              <th scope="row" className="min-h-11 py-2.5 text-left font-medium">
                {row.area}
              </th>
              {then && <td className="text-right text-muted-foreground">{row.before ?? "–"}</td>}
              <td className="text-right font-semibold text-foreground">
                {row.now}
                {row.delta !== null && row.delta > 0 && <span aria-label="subiu"> ↑</span>}
                {row.delta !== null && row.delta < 0 && <span aria-label="desceu"> ↓</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Answered({ record }: { record: ActivityRecord }) {
  const info = ACTIVITIES[record.kind];
  const sentence = record.kind === "thermometer" ? thermometerSentence(record.answers) : null;
  const avg = record.kind === "sleep" ? sleepAverage(record.answers) : null;
  const fields = info.fields.filter((f) => record.answers[f.id] !== undefined);
  return (
    <div className="space-y-6">
      {sentence && <p className="text-xl leading-snug font-medium text-foreground">{sentence}</p>}
      {avg !== null && (
        <p className="text-xl leading-snug font-medium text-foreground">
          Média de {String(avg).replace(".", ",")} horas por noite.
        </p>
      )}
      <dl className="space-y-4">
        {fields.map((field) => {
          const value = record.answers[field.id];
          const text = Array.isArray(value)
            ? value.join(", ")
            : field.type === "hours"
              ? `${String(value).replace(".", ",")} h`
              : String(value);
          return (
            <div key={field.id} className="border-t border-border pt-3">
              <dt className="text-sm text-muted-foreground">{field.label}</dt>
              <dd className="mt-1 text-base whitespace-pre-wrap text-foreground">{text}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

interface RecordDetailProps {
  record: ActivityRecord;
  all: ActivityRecord[];
  onBack: () => void;
  onRedo: () => void;
  onDelete: () => void;
}

export function RecordDetail({ record, all, onBack, onRedo, onDelete }: RecordDetailProps) {
  const [confirm, setConfirm] = useState(false);
  const info = ACTIVITIES[record.kind];
  return (
    <article className="space-y-8">
      <header className="space-y-1">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-3">
          ← Atividades
        </Button>
        <h1 className="text-4xl leading-tight font-semibold text-brand-ink">{info.title}</h1>
        <p className="text-sm text-muted-foreground">Feita em {formatDay(record.date)}</p>
      </header>

      {record.kind === "wheel" ? <Wheel record={record} all={all} /> : <Answered record={record} />}

      {record.note && (
        <section className="space-y-1 border-t border-border pt-4">
          <h3 className="text-base font-semibold text-brand-ink">Sua anotação</h3>
          <p className="text-base whitespace-pre-wrap text-foreground">“{record.note}”</p>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={onRedo}>Fazer de novo</Button>
        <Button variant="ghost" onClick={() => setConfirm(true)}>
          <Trash2 className="size-4" aria-hidden />
          Excluir esta
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Uma ferramenta de reflexão para levar à conversa com o seu profissional. Não é uma avaliação clínica.
      </p>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Excluir esta atividade?"
        description="Ela some do seu histórico e das comparações. Não dá para desfazer."
        confirmLabel="Excluir"
        onConfirm={onDelete}
      />
    </article>
  );
}
