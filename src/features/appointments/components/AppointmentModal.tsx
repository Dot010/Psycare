"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field, SelectField } from "@/components/ui/field";
import type { Agendamento, AppointmentType, CreateAppointmentInput } from "@/features/appointments/types";

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se informado, remarca esta consulta; senão cria uma nova. */
  appointment?: Agendamento;
  onSave: (
    input: CreateAppointmentInput,
    id?: string,
  ) => { success: true } | { success: false; error: string };
}

export function AppointmentModal({ open, onOpenChange, appointment, onSave }: AppointmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-semibold text-foreground">
          {appointment ? "Remarcar sessão" : "Agendar nova sessão"}
        </DialogTitle>
        <AppointmentForm appointment={appointment} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AppointmentForm({
  appointment,
  onSave,
  onClose,
}: {
  appointment?: Agendamento;
  onSave: AppointmentModalProps["onSave"];
  onClose: () => void;
}) {
  const [profissional, setProfissional] = useState(appointment?.profissional ?? "");
  const [data, setData] = useState(appointment?.data ?? "");
  const [hora, setHora] = useState(appointment?.hora ?? "");
  const [tipo, setTipo] = useState<AppointmentType>(appointment?.tipo ?? "online");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = onSave({ profissional, data, hora, tipo }, appointment?.id);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Profissional"
        value={profissional}
        onChange={(e) => setProfissional(e.target.value)}
        placeholder="Ex: Dra. Ana Silva"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        <Field label="Hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
      </div>

      <SelectField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as AppointmentType)}>
        <option value="online">Online</option>
        <option value="presencial">Presencial</option>
      </SelectField>

      {formError && (
        <p role="alert" className="text-xs text-danger-600">
          {formError}
        </p>
      )}

      <DialogFooter className="-mx-6 -mb-6 mt-2 rounded-b-2xl px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{appointment ? "Salvar nova data" : "Salvar"}</Button>
      </DialogFooter>
    </form>
  );
}
