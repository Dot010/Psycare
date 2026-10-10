"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { detectChange, KIND_INFO, KINDS, type PrescriptionDraft } from "../prescriptionRules";
import type { Prescription, PrescriptionChange } from "../types";

const CHANGE_LABEL: Record<PrescriptionChange, string> = {
  none: "Sem mudança",
  dose: "Dose mudou",
  switch: "Trocou o remédio",
  stop: "Suspendeu",
};
const CHANGES: PrescriptionChange[] = ["none", "dose", "switch", "stop"];

interface Props {
  patientName: string;
  /** Receita anterior do mesmo remédio, usada para comparar a dose. */
  last?: Prescription;
  initial: PrescriptionDraft;
  onClose: () => void;
  onIssue: (draft: PrescriptionDraft, change: PrescriptionChange, note: string) => void;
  onStop: (note: string) => void;
}

/** Nova receita em 2 toques: tudo já vem da última; o psiquiatra só confere e emite. */
export function NewPrescriptionDialog({ patientName, last, initial, onClose, onIssue, onStop }: Props) {
  const [draft, setDraft] = useState(initial);
  const [manual, setManual] = useState<PrescriptionChange | null>(null);
  const [note, setNote] = useState("");

  const detected = detectChange(last, draft);
  const change = manual ?? detected;
  const set = <K extends keyof PrescriptionDraft>(key: K, value: PrescriptionDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova receita</DialogTitle>
          <DialogDescription>
            {patientName}. Já vem preenchida com a última receita deste remédio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Remédio" value={draft.nome} onChange={(e) => set("nome", e.target.value)} />
          <Field
            label="Dose e como usar"
            value={draft.dosagem}
            onChange={(e) => set("dosagem", e.target.value)}
          />

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Tipo de receita</legend>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={draft.kind === kind}
                  onClick={() => set("kind", kind)}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm font-medium",
                    KIND_INFO[kind].chip,
                    draft.kind === kind ? "ring-2 ring-brand-600 ring-offset-2" : "opacity-80",
                  )}
                >
                  {KIND_INFO[kind].label} · {KIND_INFO[kind].paper}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field
              label="Consulta"
              type="date"
              value={draft.consultationDate}
              onChange={(e) => set("consultationDate", e.target.value)}
            />
            <Field
              label="Usar de"
              type="date"
              value={draft.useFrom}
              onChange={(e) => set("useFrom", e.target.value)}
            />
            <Field
              label="Até"
              type="date"
              value={draft.useUntil}
              onChange={(e) => set("useUntil", e.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Teve mudança?</legend>
            <div className="flex flex-wrap gap-2">
              {CHANGES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={change === c}
                  onClick={() => setManual(c)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-sm font-medium",
                    change === c
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-border bg-card text-foreground",
                  )}
                >
                  {CHANGE_LABEL[c]}
                </button>
              ))}
            </div>
            {change !== "none" && (
              <Field
                label="Em poucas palavras, o que mudou (opcional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}
            {manual === null && detected !== "none" && (
              <p className="text-xs text-muted-foreground">
                O app comparou com a receita anterior e marcou isto sozinho.
              </p>
            )}
          </fieldset>
        </div>

        <DialogFooter>
          <Button variant="outline" className="min-h-11" onClick={onClose}>
            Cancelar
          </Button>
          {change === "stop" ? (
            <Button className="min-h-11" onClick={() => onStop(note)}>
              Registrar suspensão
            </Button>
          ) : (
            <Button className="min-h-11" onClick={() => onIssue(draft, change, note)}>
              Emitir receita
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
