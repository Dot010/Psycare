"use client";

import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field, SelectField } from "@/components/ui/field";
import { NextSessionCard } from "@/features/appointments/components/NextSessionCard";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import type { Agendamento, AppointmentType } from "@/features/appointments/types";

const STATUS_STYLES: Record<Agendamento["status"], string> = {
  confirmado: "bg-brand-100 text-brand-800",
  pendente: "bg-sun-100 text-ink",
  cancelado: "bg-sunken text-muted-foreground",
};

export function AppointmentsView() {
  const { appointments, addAppointment } = useAppointments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profissional, setProfissional] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState<AppointmentType>("online");
  const [formError, setFormError] = useState("");

  const handleCreateAppointment = (e: FormEvent) => {
    e.preventDefault();

    const result = addAppointment({ profissional, data, hora, tipo });
    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setFormError("");
    setProfissional("");
    setData("");
    setHora("");
    setTipo("online");
    setIsModalOpen(false);
  };

  return (
    <Page
      width="narrow"
      title="Meus Agendamentos"
      description="Suas próximas sessões e o histórico de atendimentos."
      actions={
        <MagneticButton
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Novo agendamento
        </MagneticButton>
      }
    >
      <NextSessionCard
        action={
          <Button disabled title="Disponível em breve">
            Entrar na sala
          </Button>
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Histórico</h2>

        {appointments.length === 0 ? (
          <div className="rounded-xl border border-black/5 bg-surface p-8 text-center shadow-sm">
            <p className="text-base font-semibold text-ink">Nenhum agendamento ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Comece adicionando sua primeira sessão com um profissional.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {appointments.map((item) => (
              <li
                key={item.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-black/5 bg-surface p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-ink">{item.profissional}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.data} às {item.hora} · {item.tipo === "online" ? "Online" : "Presencial"}
                  </p>
                </div>
                <span
                  className={`self-start rounded-full px-3 py-1 text-xs font-semibold capitalize sm:self-auto ${STATUS_STYLES[item.status]}`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
          <DialogTitle className="text-xl font-semibold text-ink">Agendar nova sessão</DialogTitle>

          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <Field
              label="Profissional"
              value={profissional}
              onChange={(e) => setProfissional(e.target.value)}
              placeholder="Ex: Dra. Ana Silva"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
              <Field
                label="Hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>

            <SelectField
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as AppointmentType)}
            >
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
            </SelectField>

            {formError && (
              <p role="alert" className="text-xs text-danger-600">
                {formError}
              </p>
            )}

            <DialogFooter className="-mx-6 -mb-6 mt-2 rounded-b-2xl px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
