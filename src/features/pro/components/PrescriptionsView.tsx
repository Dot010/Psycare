"use client";

import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { patientById } from "../data";
import { daysUntil, prescriptionStatus } from "../prescriptions";
import type { Prescription } from "../types";
import { usePrescriptions } from "../hooks/usePrescriptions";

const URGENCY = { expired: 0, expiring: 1, valid: 2 } as const;

function chipFor(p: Prescription, daysLeft: number): { text: string; className: string } {
  if (p.status === "suspended") return { text: "Suspensa", className: "bg-sunken text-muted-foreground" };
  const status = prescriptionStatus(daysLeft);
  if (status === "expired") {
    const days = Math.abs(daysLeft);
    return { text: `Vencida há ${days} ${days === 1 ? "dia" : "dias"}`, className: "bg-sun-200 text-ink" };
  }
  if (status === "expiring") {
    const text = daysLeft === 0 ? "Vence hoje" : `Vence em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`;
    return { text, className: "bg-sun-100 text-ink" };
  }
  return { text: "Válida", className: "bg-brand-100 text-brand-ink" };
}

export default function PrescriptionsView() {
  const { today, prescriptions, renew, adjust, suspend } = usePrescriptions();
  const [message, setMessage] = useState("");

  const rows = prescriptions
    .map((p) => ({ p, daysLeft: daysUntil(p.validUntil, today) }))
    .sort((a, b) => {
      const ua = a.p.status === "suspended" ? 3 : URGENCY[prescriptionStatus(a.daysLeft)];
      const ub = b.p.status === "suspended" ? 3 : URGENCY[prescriptionStatus(b.daysLeft)];
      return ua - ub || a.daysLeft - b.daysLeft;
    });

  const toAttend = rows.filter(
    ({ p, daysLeft }) => p.status === "active" && prescriptionStatus(daysLeft) !== "valid",
  ).length;

  return (
    <Page
      title="Receitas"
      description={
        toAttend > 0
          ? `${toAttend} ${toAttend === 1 ? "receita precisa" : "receitas precisam"} da sua atenção.`
          : "Nenhuma receita precisa de atenção agora."
      }
      width="narrow"
    >
      <DemoNotice>
        Renovar, ajustar e suspender são simulados. Nenhuma receita é emitida e nenhum paciente é avisado de
        verdade.
      </DemoNotice>

      <p role="status" className="min-h-6 text-sm text-brand-ink">
        {message}
      </p>

      <ul className="space-y-3">
        {rows.map(({ p, daysLeft }) => {
          const chip = chipFor(p, daysLeft);
          const active = p.status === "active";
          return (
            <li
              key={p.id}
              className={cn(
                "space-y-3 rounded-2xl border border-border bg-card p-4",
                !active && "opacity-70",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{patientById(p.patientId)?.name}</p>
                  <h2 className="text-lg font-semibold text-foreground">{p.nome}</h2>
                  <p className="text-sm text-muted-foreground">{p.dosagem}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", chip.className)}>
                  {chip.text}
                </span>
              </div>
              {p.controlled && (
                <p className="text-xs font-medium text-muted-foreground">Receita de controle especial</p>
              )}
              {p.note && <p className="text-sm text-muted-foreground">{p.note}</p>}
              {active && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="min-h-11"
                    onClick={() => {
                      renew(p.id);
                      setMessage(`${p.nome}: renovação simulada. Nada foi emitido.`);
                    }}
                  >
                    Renovar
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      adjust(p.id);
                      setMessage(`${p.nome}: ajuste de dose simulado.`);
                    }}
                  >
                    Ajustar dose
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      suspend(p.id);
                      setMessage(`${p.nome}: suspensão simulada. O paciente seria avisado.`);
                    }}
                  >
                    Suspender
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
