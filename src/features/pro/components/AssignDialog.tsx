"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { ACTIVITIES, ACTIVITY_KINDS } from "@/features/activities/catalog";
import type { ActivityKind } from "@/features/activities/types";
import { toISODate } from "@/lib/dates";
import { PATIENTS } from "../data";

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando já se sabe o paciente (tela do paciente), não pergunta. */
  patientId?: string;
  kind?: ActivityKind;
  onAssign: (patientId: string, kind: ActivityKind, dueDate: string, message: string) => void;
}

const control = "h-11 w-full rounded-lg border border-border bg-card px-3 text-base";

export function AssignDialog(props: AssignDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">Pedir uma atividade</DialogTitle>
        {props.open && <AssignForm {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function AssignForm({ patientId, kind: initialKind, onAssign, onOpenChange }: AssignDialogProps) {
  const [patient, setPatient] = useState(patientId ?? PATIENTS[0].id);
  const [kind, setKind] = useState<ActivityKind>(initialKind ?? "wheel");
  const [due, setDue] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onAssign(patient, kind, due, message);
        onOpenChange(false);
      }}
    >
      {!patientId && (
        <label className="block space-y-1 text-sm text-muted-foreground">
          Paciente
          <select value={patient} onChange={(e) => setPatient(e.target.value)} className={control}>
            {PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block space-y-1 text-sm text-muted-foreground">
        Atividade
        <select value={kind} onChange={(e) => setKind(e.target.value as ActivityKind)} className={control}>
          {ACTIVITY_KINDS.map((k) => (
            <option key={k} value={k}>
              {ACTIVITIES[k].title}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1 text-sm text-muted-foreground">
        Para quando (opcional)
        <input
          type="date"
          min={toISODate(new Date())}
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className={control}
        />
      </label>
      <label className="block space-y-1 text-sm text-muted-foreground">
        Uma orientação (opcional)
        <textarea
          rows={2}
          maxLength={300}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: escolha uma situação da semana"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-base"
        />
      </label>
      <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button type="submit">Pedir</Button>
      </DialogFooter>
    </form>
  );
}
