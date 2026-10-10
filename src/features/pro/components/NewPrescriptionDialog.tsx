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
import { addDays } from "@/features/health/logic";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { detectChange, draftFrom, KIND_INFO, KINDS, type PrescriptionDraft } from "../prescriptionRules";
import type {
  Consultation,
  Prescription,
  PrescriptionChange,
  PrescriptionOrigin,
  PrescriptionRequest,
} from "../types";

const CHANGE_LABEL: Record<PrescriptionChange, string> = {
  none: "Sem mudança",
  dose: "Dose mudou",
  switch: "Trocou o remédio",
  stop: "Suspendeu",
};
const CHANGES: PrescriptionChange[] = ["none", "dose", "switch", "stop"];

interface Props {
  patientName: string;
  today: string;
  /** Receita anterior do mesmo remédio: serve para preencher e para comparar a dose. */
  last: Prescription;
  /** Se veio de um pedido do paciente, a receita nasce dele e não precisa de consulta. */
  request?: PrescriptionRequest;
  /** Consultas em que a receita pode sair (quando não vem de um pedido). */
  consultations: Consultation[];
  onClose: () => void;
  onRegister: (
    draft: PrescriptionDraft,
    origin: PrescriptionOrigin,
    change: PrescriptionChange,
    note: string,
  ) => void;
  onStop: (note: string) => void;
}

/**
 * Registrar receita em 2 toques. O app não emite nem envia nada: o psiquiatra entrega o papel em mãos
 * e aqui registra o que preparou, para o paciente saber que está pronto e até quando vale.
 */
export function NewPrescriptionDialog({
  patientName,
  today,
  last,
  request,
  consultations,
  onClose,
  onRegister,
  onStop,
}: Props) {
  const fromRequest = Boolean(request);
  const [consultationId, setConsultationId] = useState(consultations[0]?.id ?? "");
  const [draft, setDraft] = useState<PrescriptionDraft>(() =>
    draftFrom(last, request ? today : (consultations[0]?.date ?? today)),
  );
  const [manual, setManual] = useState<PrescriptionChange | null>(null);
  const [note, setNote] = useState("");

  if (!fromRequest && consultations.length === 0) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sem consulta para esta receita</DialogTitle>
            <DialogDescription>
              {patientName} não teve consulta depois da última receita de {last.nome}. A receita sai de uma
              consulta ou de um pedido do paciente que você avaliou. Marque a consulta na Agenda e volte aqui.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={onClose}>
              Entendi
            </Button>
            <Button asChild className="min-h-11">
              <a href="/dashboard/pro/agenda">Abrir a agenda</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const detected = detectChange(last, draft);
  const change = manual ?? detected;
  const set = <K extends keyof PrescriptionDraft>(key: K, value: PrescriptionDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const label = (c: Consultation) =>
    `${c.date === today ? "Hoje" : c.date === addDays(today, -1) ? "Ontem" : formatDateBR(c.date)}, ${c.hora}`;
  const origin: PrescriptionOrigin = request
    ? { type: "request", requestId: request.id }
    : { type: "consultation", consultationId };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar receita</DialogTitle>
          <DialogDescription>
            {patientName}. {request ? "Do pedido do paciente." : "De uma consulta."} Já vem preenchida com a
            última receita. O app não envia a receita: você a entrega em mãos e aqui só registra.
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

          {!fromRequest && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Consulta em que ela sai</legend>
              <div className="flex flex-wrap gap-2">
                {consultations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={consultationId === c.id}
                    onClick={() => {
                      setConsultationId(c.id);
                      const base = draftFrom(last, c.date);
                      setDraft((current) => ({ ...current, useFrom: base.useFrom, useUntil: base.useUntil }));
                    }}
                    className={cn(
                      "min-h-11 rounded-full border px-4 text-sm font-medium",
                      consultationId === c.id
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-border bg-card text-foreground",
                    )}
                  >
                    {label(c)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <Button className="min-h-11" onClick={() => onRegister(draft, origin, change, note)}>
              Registrar receita
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
