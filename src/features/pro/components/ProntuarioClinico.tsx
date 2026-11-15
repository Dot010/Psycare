"use client";

import Link from "next/link";
import { useState } from "react";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { advanceLabel, EXAM_CATALOG, STEP_LABEL } from "../exams";
import { useExams } from "../hooks/useExams";
import { usePrescriptions } from "../hooks/usePrescriptions";
import { usePro } from "../hooks/usePro";
import { medicationHistory } from "../logic";
import type { PrescriptionChange } from "../types";

const CHANGE_TEXT: Record<PrescriptionChange, string> = {
  none: "sem mudança",
  dose: "dose mudou",
  switch: "trocou o remédio",
  stop: "suspendeu",
};

/**
 * Aba Medicação do prontuário do psiquiatra: um cartão por remédio, com a receita atual,
 * as anteriores e a adesão que o paciente marca no app dele (só se ele compartilhar).
 */
export function MedicationTab({ patientId, firstName }: { patientId: string; firstName: string }) {
  const { prescriptions } = usePrescriptions();
  const pro = usePro();
  const history = medicationHistory(prescriptions, patientId);
  const meds = pro.snapshotOf(patientId)?.meds;

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma receita registrada para {firstName}.</p>
      ) : (
        <ul className="space-y-3">
          {history.map(({ nome, current, previous }) => {
            const line = meds?.find((m) => m.nome.trim().toLowerCase() === nome.trim().toLowerCase());
            const inUse = current.status === "ready";
            return (
              <li
                key={nome}
                className="flex flex-wrap items-start gap-4 rounded-2xl border border-border p-4"
              >
                <div className="min-w-0 flex-1 basis-56 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{nome}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        inUse ? "bg-brand-100 text-brand-ink" : "bg-sunken text-muted-foreground",
                      )}
                    >
                      {inUse ? "Em uso" : "Suspenso"}
                    </span>
                  </div>
                  <p className="text-sm">{current.dosagem}</p>
                  <p className="text-xs text-muted-foreground">
                    Receita de {formatDateBR(current.preparedAt)} · {CHANGE_TEXT[current.change]}
                    {current.changeNote ? ` · ${current.changeNote}` : ""}
                  </p>
                  {previous.length > 0 && (
                    <ol
                      aria-label={`Receitas anteriores de ${nome}`}
                      className="mt-2 border-l-2 border-border pl-3"
                    >
                      {previous.map((p) => (
                        <li key={p.id} className="text-xs text-muted-foreground">
                          {formatDateBR(p.preparedAt)}: {p.dosagem}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                {inUse &&
                  (line && line.planned > 0 ? (
                    <div className="flex items-center gap-3">
                      <ProgressRing
                        value={line.taken / line.planned}
                        label={`${line.taken} de ${line.planned} doses marcadas em 7 dias`}
                        size={64}
                        thickness={12}
                      >
                        <span className="text-xs font-semibold">
                          {Math.round((line.taken / line.planned) * 100)}%
                        </span>
                      </ProgressRing>
                      <p className="max-w-32 text-xs text-muted-foreground">
                        {line.taken} de {line.planned} doses marcadas em 7 dias
                      </p>
                    </div>
                  ) : (
                    <p className="max-w-40 text-xs text-muted-foreground">
                      {meds ? "Sem doses marcadas no app." : "Adesão não compartilhada."}
                    </p>
                  ))}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        A adesão vem do &quot;tomado&quot; que {firstName} marca no app, e só aparece se {firstName}{" "}
        compartilhar a saúde. O app não emite nem muda receita.{" "}
        <Link href="/dashboard/pro/prescriptions" className="font-medium text-brand-ink underline">
          Ir para Receitas
        </Link>
      </p>
    </div>
  );
}

/** Aba Exames do prontuário: pedidos e resultados de um paciente, e pedir um novo. */
export function ExamsTab({ patientId, firstName }: { patientId: string; firstName: string }) {
  const { exams, requestExam, advanceExam } = useExams();
  const [choice, setChoice] = useState(EXAM_CATALOG[0]);
  const mine = exams.filter((e) => e.patientId === patientId);

  return (
    <div className="space-y-4">
      {mine.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum exame pedido para {firstName}.</p>
      ) : (
        <ul>
          {mine.map((exam) => {
            const next = advanceLabel(exam.step);
            return (
              <li
                key={exam.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-sunken py-3 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="text-base font-medium">{exam.nome}</p>
                  <p className="text-xs text-muted-foreground">Pedido em {formatDateBR(exam.requestedAt)}</p>
                  {exam.result && <p className="mt-1 text-sm">{exam.result}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      exam.step === 3 ? "bg-brand-100 text-brand-ink" : "bg-sun-100 text-sun-700",
                    )}
                  >
                    {STEP_LABEL[exam.step]}
                  </span>
                  {next && (
                    <Button size="sm" variant="outline" onClick={() => advanceExam(exam)}>
                      {next}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          requestExam(patientId, choice);
        }}
      >
        <label htmlFor="novo-exame" className="sr-only">
          Exame a pedir
        </label>
        <select
          id="novo-exame"
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className={cn(fieldControlClass, "w-auto min-w-48 flex-1")}
        >
          {EXAM_CATALOG.map((nome) => (
            <option key={nome}>{nome}</option>
          ))}
        </select>
        <Button type="submit">Pedir exame</Button>
      </form>
    </div>
  );
}
