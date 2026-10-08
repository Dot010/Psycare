import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { patientById } from "../data";
import type { ProSession } from "../types";

const STATUS_LABEL: Record<ProSession["status"], string> = {
  confirmado: "Confirmada",
  pendente: "Aguardando",
  cancelado: "Cancelada",
  realizada: "Realizada",
};

export function SessionLine({ session, actions }: { session: ProSession; actions?: ReactNode }) {
  const patient = patientById(session.patientId);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3">
      <div className="min-w-0">
        <p className="text-lg font-medium text-foreground">
          <span className="mr-3 tabular-nums text-brand-ink">{session.hora}</span>
          {patient?.name ?? "Paciente"}
        </p>
        <p className="text-sm text-muted-foreground">
          {session.tipo === "online" ? "Online" : "Presencial"} ·{" "}
          <span className={cn(session.status === "pendente" && "font-medium text-sun-800")}>
            {STATUS_LABEL[session.status]}
          </span>
        </p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </li>
  );
}
