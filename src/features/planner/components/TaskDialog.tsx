"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { addDays } from "@/features/health/logic";
import { cn } from "@/lib/utils";
import { buildTask, IMPORTANCE_LABEL, IMPORTANCES, isLocked } from "../logic";
import type { Importance, Task } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  today: string;
  /** Se informada, edita esta tarefa; senão cria uma nova. */
  task?: Task;
  /** Dia sugerido para uma tarefa nova (por exemplo, o dia aberto no calendário). */
  defaultDate?: string;
  onSave: (task: Task) => void;
}

const SOURCE_TEXT: Record<Exclude<Task["source"], "free">, string> = {
  consulta: "da sua consulta",
  receita: "da sua receita",
  encaminhamento: "do seu encaminhamento",
  habito: "dos seus hábitos",
};

export function TaskDialog({ open, onOpenChange, ...rest }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">
          {rest.task ? "Editar tarefa" : "Nova tarefa"}
        </DialogTitle>
        <TaskForm {...rest} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({
  today,
  task,
  defaultDate,
  onSave,
  onClose,
}: Omit<Props, "open" | "onOpenChange"> & { onClose: () => void }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [date, setDate] = useState(task ? (task.date ?? "") : (defaultDate ?? today));
  const [time, setTime] = useState(task?.time ?? "");
  const [importance, setImportance] = useState<Importance>(task?.importance ?? "medium");
  const [error, setError] = useState("");
  const locked = task ? isLocked(task) : false;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const built = buildTask({
      id: task?.id ?? crypto.randomUUID(),
      title,
      date,
      time,
      importance,
      done: task?.done,
      source: task?.source,
    });
    if (!built) {
      setError("Escreva o que precisa ser feito");
      return;
    }
    onSave(built);
    onClose();
  };

  const chip = (on: boolean) =>
    cn(
      "min-h-11 rounded-full border px-4 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
      on
        ? "border-brand-600 bg-brand-100 font-medium text-brand-ink"
        : "border-border text-foreground hover:border-brand-600",
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="O que fazer"
        value={title}
        maxLength={80}
        disabled={locked}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex: Comprar o remédio"
        error={error}
      />
      {locked && task && task.source !== "free" && (
        <p className="text-xs text-muted-foreground">
          Esta tarefa é {SOURCE_TEXT[task.source]}. Você pode mudar o dia, a hora e a importância.
        </p>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Quando?</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de dia">
          <button
            type="button"
            aria-pressed={date === today}
            className={chip(date === today)}
            onClick={() => setDate(today)}
          >
            Hoje
          </button>
          <button
            type="button"
            aria-pressed={date === addDays(today, 1)}
            className={chip(date === addDays(today, 1))}
            onClick={() => setDate(addDays(today, 1))}
          >
            Amanhã
          </button>
          <button
            type="button"
            aria-pressed={date === ""}
            className={chip(date === "")}
            onClick={() => setDate("")}
          >
            Sem dia
          </button>
        </div>
        <Field
          label="Dia (abre o calendário)"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Field label="Hora (opcional)" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <div role="radiogroup" aria-label="Importância" className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Importância</p>
        <div className="flex gap-2">
          {IMPORTANCES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={importance === value}
              className={chip(importance === value)}
              onClick={() => setImportance(value)}
            >
              {IMPORTANCE_LABEL[value]}
            </button>
          ))}
        </div>
      </div>

      <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{task ? "Salvar alterações" : "Salvar tarefa"}</Button>
      </DialogFooter>
    </form>
  );
}
