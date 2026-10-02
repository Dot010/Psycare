"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import type { Medicamento } from "@/features/health/types";

const medicamentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do remédio"),
  dosagem: z.string().trim().min(1, "Informe a dosagem"),
  frequencia: z.string().trim().optional(),
  horario: z.string().trim().optional(),
});

interface MedicamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, edita este medicamento; senão cria um novo. */
  item?: Medicamento;
  onSave: (item: Medicamento) => void;
}

export function MedicamentoDialog({ open, onOpenChange, item, onSave }: MedicamentoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">
          {item ? "Editar medicamento" : "Novo medicamento"}
        </DialogTitle>
        <MedicamentoForm item={item} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function MedicamentoForm({
  item,
  onSave,
  onClose,
}: {
  item?: Medicamento;
  onSave: (item: Medicamento) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    nome: item?.nome ?? "",
    dosagem: item?.dosagem ?? "",
    frequencia: item?.frequencia ?? "",
    horario: item?.horario ?? "",
  });
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = medicamentoSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    onSave({
      id: item?.id ?? crypto.randomUUID(),
      nome: parsed.data.nome,
      dosagem: parsed.data.dosagem,
      frequencia: parsed.data.frequencia || "Uso diário",
      horario: parsed.data.horario || "Horário livre",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Nome do remédio"
        required
        value={form.nome}
        onChange={set("nome")}
        placeholder="Ex: Sertralina"
      />
      <Field
        label="Dosagem"
        required
        value={form.dosagem}
        onChange={set("dosagem")}
        placeholder="Ex: 50 mg"
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Frequência"
          value={form.frequencia}
          onChange={set("frequencia")}
          placeholder="Ex: Diária"
        />
        <Field label="Horário" value={form.horario} onChange={set("horario")} placeholder="Ex: 21:00" />
      </div>
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
