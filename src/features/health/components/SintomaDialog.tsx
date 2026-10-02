"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import type { Sintoma } from "@/features/health/types";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";

const sintomaSchema = z.object({
  descricao: z.string().trim().min(2, "Descreva o sintoma"),
  nota: z.string().trim().optional(),
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
  const [form, setForm] = useState({ descricao: item?.descricao ?? "", nota: item?.nota ?? "" });
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
      data: item?.data ?? formatDateBR(toISODate(new Date())),
      nota: parsed.data.nota || "Sem observações",
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
        label="Intensidade ou nota"
        value={form.nota}
        onChange={set("nota")}
        placeholder="Ex: Moderada"
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
