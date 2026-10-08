"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { isTime, MAX_TIMES, medTimes } from "@/features/health/logic";
import type { Medicamento } from "@/features/health/types";

const medicamentoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do remédio").max(60),
  dosagem: z.string().trim().min(1, "Informe a dosagem").max(40),
  observacao: z.string().trim().max(60).optional(),
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
    observacao: item?.observacao ?? "",
  });
  const [times, setTimes] = useState<string[]>(item ? medTimes(item) : ["08:00"]);
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
    const clean = [...new Set(times.filter(isTime))].sort();
    onSave({
      id: item?.id ?? crypto.randomUUID(),
      nome: parsed.data.nome,
      dosagem: parsed.data.dosagem,
      observacao: parsed.data.observacao || undefined,
      horarios: clean,
      horario: clean.join(", ") || "Horário livre",
      frequencia: clean.length ? `${clean.length}x ao dia` : "Quando necessário",
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
      <Field
        label="Observação (opcional)"
        value={form.observacao}
        onChange={set("observacao")}
        placeholder="Ex: com comida, antes de dormir"
      />

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-muted-foreground">Horários das doses</legend>
        {times.map((time, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="time"
              aria-label={`Horário ${index + 1}`}
              value={time}
              onChange={(e) =>
                setTimes((current) => current.map((t, i) => (i === index ? e.target.value : t)))
              }
              className="h-11 flex-1 rounded-lg border border-border bg-card px-3"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remover horário ${index + 1}`}
              onClick={() => setTimes((current) => current.filter((_, i) => i !== index))}
            >
              <X />
            </Button>
          </div>
        ))}
        {times.length < MAX_TIMES && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTimes((current) => [...current, "20:00"])}
          >
            <Plus />
            Adicionar horário
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          O app só lembra o que você cadastra. Ele nunca muda uma dose: isso é com o seu médico.
        </p>
      </fieldset>

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
