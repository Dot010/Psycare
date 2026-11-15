"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fieldControlClass } from "@/components/ui/input";
import { fromISODate } from "@/lib/dates";
import { addDays } from "@/features/health/logic";
import { groupByDay } from "../logic";
import { usePro } from "../hooks/usePro";
import { CloseSession } from "./CloseSession";
import { useProIdentity } from "./ProIdentity";
import { SessionLine } from "./SessionLine";

function dayTitle(iso: string, today: string): string {
  if (iso === today) return "Hoje";
  if (iso === addDays(today, 1)) return "Amanhã";
  const text = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(
    fromISODate(iso),
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function AgendaView() {
  const pro = usePro();
  const me = useProIdentity();
  const noun = me.specialty === "psychiatrist" ? "consulta" : "sessão";
  const [closing, setClosing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const upcoming = groupByDay(pro.sessions.filter((s) => s.data >= pro.today && s.status !== "cancelado"));
  const past = groupByDay(pro.sessions.filter((s) => s.data < pro.today)).reverse();

  return (
    <Page
      title="Agenda"
      description={noun === "consulta" ? "Suas próximas consultas." : "Suas próximas sessões."}
      width="narrow"
      className="space-y-10"
      actions={
        <Button onClick={() => setAdding(true)}>
          <Plus />
          Nova {noun}
        </Button>
      }
    >
      {upcoming.length === 0 && <p className="text-base text-muted-foreground">Nenhuma sessão marcada.</p>}
      {upcoming.map((group) => (
        <section key={group.date} aria-label={dayTitle(group.date, pro.today)} className="space-y-1">
          <h2 className="text-2xl font-semibold text-brand-ink">{dayTitle(group.date, pro.today)}</h2>
          <ul>
            {group.items.map((s) => {
              const patient = pro.patients.find((p) => p.id === s.patientId);
              const open = closing === s.id;
              return (
                <SessionLine
                  key={s.id}
                  session={s}
                  below={
                    open &&
                    patient && (
                      // O mesmo encerramento do painel: evolução, cobrança e tarefa de uma vez.
                      <CloseSession
                        patientName={patient.name}
                        fee={patient.fee}
                        today={pro.today}
                        noun={noun}
                        by={me.name}
                        onCancel={() => setClosing(null)}
                        onClose={(input) => {
                          const error = pro.closeSession(s, input);
                          if (!error) setClosing(null);
                          return error;
                        }}
                      />
                    )
                  }
                  actions={
                    <>
                      {s.status === "pendente" && (
                        <Button size="sm" onClick={() => pro.setSessionStatus(s.id, "confirmado")}>
                          Confirmar
                        </Button>
                      )}
                      {s.status === "confirmado" && s.data === pro.today && (
                        <Button
                          size="sm"
                          variant="outline"
                          aria-expanded={open}
                          onClick={() => setClosing(open ? null : s.id)}
                        >
                          Encerrar {noun}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => pro.setSessionStatus(s.id, "cancelado")}
                      >
                        Cancelar
                      </Button>
                    </>
                  }
                />
              );
            })}
          </ul>
        </section>
      ))}

      {past.length > 0 && (
        <section aria-labelledby="past-title" className="space-y-1 border-t border-border pt-8">
          <h2 id="past-title" className="text-2xl font-semibold text-brand-ink">
            Anteriores
          </h2>
          {past.map((group) => (
            <div key={group.date}>
              <h3 className="mt-3 text-sm text-muted-foreground">{dayTitle(group.date, pro.today)}</h3>
              <ul>
                {group.items.map((s) => (
                  <SessionLine key={s.id} session={s} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      <NewSessionDialog open={adding} onOpenChange={setAdding} noun={noun} />
    </Page>
  );
}

/** Marcar uma sessão pela agenda: paciente, dia, hora e se é online ou presencial. */
function NewSessionDialog({
  open,
  onOpenChange,
  noun,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noun: string;
}) {
  const pro = usePro();
  const [error, setError] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">Nova {noun}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Entra na sua agenda já confirmada.
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const result = pro.addSession({
              patientId: String(form.get("patient") ?? ""),
              data: String(form.get("date") ?? ""),
              hora: String(form.get("time") ?? ""),
              tipo: form.get("kind") === "presencial" ? "presencial" : "online",
            });
            setError(result ?? "");
            if (!result) onOpenChange(false);
          }}
        >
          <div className="space-y-1">
            <label htmlFor="ns-patient" className="block text-sm font-semibold">
              Paciente
            </label>
            <select id="ns-patient" name="patient" className={fieldControlClass} defaultValue="">
              <option value="" disabled>
                Escolha
              </option>
              {pro.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="ns-date" className="block text-sm font-semibold">
                Dia
              </label>
              <input
                id="ns-date"
                name="date"
                type="date"
                min={pro.today}
                defaultValue={pro.today}
                className={fieldControlClass}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="ns-time" className="block text-sm font-semibold">
                Hora
              </label>
              <input
                id="ns-time"
                name="time"
                type="time"
                defaultValue="10:00"
                className={fieldControlClass}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="ns-kind" className="block text-sm font-semibold">
              Como
            </label>
            <select id="ns-kind" name="kind" className={fieldControlClass} defaultValue="online">
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>
          {error && (
            <p role="alert" className="text-sm text-danger-600">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit">Marcar</Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
