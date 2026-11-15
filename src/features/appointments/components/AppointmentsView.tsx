"use client";

import { CalendarPlus, Download, Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ItemMenu } from "@/components/feedback/ItemMenu";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Block } from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { AppointmentModal } from "@/features/appointments/components/AppointmentModal";
import { NextSessionCard } from "@/features/appointments/components/NextSessionCard";
import { SessionPrep } from "@/features/appointments/components/SessionPrep";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { buildIcs, splitAppointments } from "@/features/appointments/logic";
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
    <li className="flex items-center justify-between gap-3 border-t border-sunken py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="font-medium text-foreground">{item.profissional}</p>
        <p className="text-sm text-muted-foreground">
          {formatDateBR(item.data)} às {item.hora} · {item.tipo === "online" ? "Online" : "Presencial"}
        </p>
        {item.observacao && <p className="text-sm text-foreground">Lembrar de: {item.observacao}</p>}
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

  const exportCalendar = () => {
    const blob = new Blob([buildIcs(upcoming)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "psycare-consultas.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const openNew = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const professionals = [
    ...new Set(appointments.filter((a) => a.status !== "cancelado").map((a) => a.profissional)),
  ];

  return (
    <Page
      width="wide"
      title="Sua próxima sessão"
      kicker="Consultas"
      description="Chegue com o que importa já separado."
      actions={
        <MagneticButton
          type="button"
          onClick={openNew}
          className="inline-flex h-10 pointer-coarse:h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-700"
        >
          <Plus className="size-4" />
          Novo agendamento
        </MagneticButton>
      }
    >
      <PageColumns
        aside={
          <>
            <NextSessionCard
              action={
                <Button disabled title="Demonstração: a sala de vídeo ainda não existe">
                  Entrar na sala (em breve)
                </Button>
              }
            />
            {professionals.length > 0 && (
              <Block title="Quem cuida de você">
                <ul className="space-y-3">
                  {professionals.map((name) => (
                    <li key={name} className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-ink"
                      >
                        {name.replace(/^(Dra?\.)\s*/, "").charAt(0)}
                      </span>
                      <span className="text-sm">{name}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </>
        }
      >
        <SessionPrep />

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
            <Block
              title="Próximas"
              aside={
                upcoming.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={exportCalendar}>
                    <Download />
                    Exportar para o calendário
                  </Button>
                )
              }
            >
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma sessão futura.</p>
              ) : (
                <ul>
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
            </Block>

            {past.length > 0 && (
              <Block title="Histórico">
                <ul>
                  {past.map((item) => (
                    <AppointmentRow key={item.id} item={item} />
                  ))}
                </ul>
              </Block>
            )}
          </>
        )}
      </PageColumns>

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
