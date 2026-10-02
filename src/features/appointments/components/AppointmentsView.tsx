"use client";

import { CalendarPlus, Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Button } from "@/components/ui/button";
import { AppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { NextSessionCard } from "@/features/appointments/components/NextSessionCard";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { splitAppointments } from "@/features/appointments/logic";
import type { Agendamento } from "@/features/appointments/types";
import { toISODate } from "@/lib/dates";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Agendamento["status"], string> = {
  confirmado: "bg-brand-100 text-brand-ink",
  pendente: "bg-sun-100 text-ink",
  cancelado: "bg-sunken text-muted-foreground",
};

function AppointmentRow({
  item,
  onReschedule,
  onCancel,
}: {
  item: Agendamento;
  onReschedule?: () => void;
  onCancel?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{item.profissional}</p>
        <p className="text-sm text-muted-foreground">
          {formatDateBR(item.data)} às {item.hora} · {item.tipo === "online" ? "Online" : "Presencial"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold capitalize",
            STATUS_STYLES[item.status],
          )}
        >
          {item.status}
        </span>
        {(onReschedule || onCancel) && (
          <ItemMenu
            label={`consulta com ${item.profissional}`}
            editLabel="Remarcar"
            deleteLabel="Cancelar consulta"
            onEdit={onReschedule}
            onDelete={onCancel}
          />
        )}
      </div>
    </li>
  );
}

export function AppointmentsView() {
  const { appointments, saveAppointment, cancelAppointment } = useAppointments();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Agendamento | undefined>();
  const [cancelling, setCancelling] = useState<Agendamento | undefined>();

  const now = new Date();
  const { upcoming, past } = splitAppointments(
    appointments,
    `${toISODate(now)}T${now.toTimeString().slice(0, 5)}`,
  );

  const openNew = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  return (
    <Page
      width="narrow"
      title="Meus Agendamentos"
      description="Suas próximas sessões e o histórico de atendimentos."
      actions={
        <MagneticButton
          type="button"
          onClick={openNew}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-700"
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

      {appointments.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento ainda"
          description="Comece adicionando sua primeira sessão com um profissional."
          action={
            <Button onClick={openNew}>
              <CalendarPlus />
              Agendar sessão
            </Button>
          }
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Próximas</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma sessão futura.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((item) => (
                  <AppointmentRow
                    key={item.id}
                    item={item}
                    onReschedule={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                    onCancel={() => setCancelling(item)}
                  />
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Histórico</h2>
              <ul className="space-y-3">
                {past.map((item) => (
                  <AppointmentRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        appointment={editing}
        onSave={saveAppointment}
      />

      <ConfirmDialog
        open={cancelling !== undefined}
        onOpenChange={(open) => !open && setCancelling(undefined)}
        title="Cancelar esta consulta?"
        description={
          cancelling
            ? `A sessão com ${cancelling.profissional} em ${formatDateBR(cancelling.data)} às ${cancelling.hora} será cancelada e ficará no histórico.`
            : ""
        }
        confirmLabel="Cancelar consulta"
        onConfirm={() => cancelling && cancelAppointment(cancelling.id)}
      />
    </Page>
  );
}
