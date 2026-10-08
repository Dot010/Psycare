"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import type { Sintoma } from "@/features/health/types";
import { INTENSITY_LABELS } from "@/features/health/logic";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const sintomaSchema = z.object({
  descricao: z.string().trim().min(2, "Descreva o sintoma"),
  nota: z.string().trim().max(200).optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha uma data"),
});

interface SintomaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, edita este sintoma; senão cria um novo. */
  item?: Sintoma;
  onSave: (item: Sintoma) => void;
}

export function SintomaDialog({ open, onOpenChange, item, onSave }: SintomaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">
          {item ? "Editar sintoma" : "Registrar sintoma"}
        </DialogTitle>
        <SintomaForm item={item} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SintomaForm({
  item,
  onSave,
  onClose,
}: {
  item?: Sintoma;
  onSave: (item: Sintoma) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    descricao: item?.descricao ?? "",
    nota: item?.nota ?? "",
    data: item?.data ?? toISODate(new Date()),
  });
  const [intensidade, setIntensidade] = useState<number>(item?.intensidade ?? 3);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = sintomaSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    onSave({
      id: item?.id ?? crypto.randomUUID(),
      descricao: parsed.data.descricao,
      data: parsed.data.data,
      nota: parsed.data.nota ?? "",
      intensidade,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Sintoma"
        required
        value={form.descricao}
        onChange={set("descricao")}
        placeholder="Ex: Insônia, dor de cabeça"
      />
      <Field
        label="Dia"
        type="date"
        required
        max={toISODate(new Date())}
        value={form.data}
        onChange={set("data")}
      />
      <div role="radiogroup" aria-label="Intensidade" className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Intensidade: {INTENSITY_LABELS[intensidade - 1]}
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={intensidade === n}
              aria-label={`${n} de 5, ${INTENSITY_LABELS[n - 1]}`}
              onClick={() => setIntensidade(n)}
              className={cn(
                "size-10 rounded-full border text-sm font-medium",
                intensidade === n ? "border-brand-600 bg-brand-600 text-white" : "border-border bg-card",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <Field
        label="Observação (opcional)"
        value={form.nota}
        onChange={set("nota")}
        placeholder="Ex: piorou à noite"
      />
      {error && (
        <p role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}
      <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
}
