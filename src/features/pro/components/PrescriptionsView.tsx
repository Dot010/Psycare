"use client";

import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PATIENTS } from "../data";
import { usePrescriptions } from "../hooks/usePrescriptions";
import {
  draftFrom,
  KIND_INFO,
  latestPerMedicine,
  lifecycle,
  needsAttention,
  type Lifecycle,
  type PrescriptionDraft,
} from "../prescriptionRules";
import type { Prescription } from "../types";
import { NewPrescriptionDialog } from "./NewPrescriptionDialog";

const LIFECYCLE_CHIP: Record<Lifecycle, { text: string; className: string }> = {
  issued: { text: "Emitida", className: "bg-brand-100 text-brand-ink" },
  used: { text: "Usada", className: "bg-sunken text-muted-foreground" },
  expired: { text: "Vencida", className: "bg-sun-200 text-ink" },
  stopped: { text: "Suspensa", className: "bg-sunken text-muted-foreground" },
};

type Filter = "attention" | "all";

interface Opening {
  last: Prescription;
  requestId?: string;
}

export default function PrescriptionsView() {
  const { today, prescriptions, requests, lastOf, issue, stop, patientName } = usePrescriptions();
  const [filter, setFilter] = useState<Filter>("attention");
  const [opening, setOpening] = useState<Opening | null>(null);

  const latest = latestPerMedicine(prescriptions);
  const latestIds = new Set(latest.map((p) => p.id));
  const attentionIds = new Set(latest.filter((p) => needsAttention(p, today)).map((p) => p.id));

  const groups = PATIENTS.map((patient) => {
    const all = prescriptions
      .filter((p) => p.patientId === patient.id)
      .sort((a, b) => b.consultationDate.localeCompare(a.consultationDate));
    const shown = filter === "all" ? all : all.filter((p) => attentionIds.has(p.id));
    return { patient, shown };
  }).filter((g) => g.shown.length > 0);

  const toAttend = requests.length + attentionIds.size;

  const openFromRequest = (patientId: string, nome: string, requestId: string) => {
    const last = lastOf(patientId, nome);
    if (last) setOpening({ last, requestId });
  };

  return (
    <Page
      title="Receitas"
      description={
        toAttend > 0
          ? `${toAttend} ${toAttend === 1 ? "item precisa" : "itens precisam"} da sua atenção.`
          : "Nada precisa da sua atenção agora."
      }
      width="narrow"
    >
      <DemoNotice>
        Nenhuma receita é emitida de verdade e nenhum paciente é avisado. Cada receita é de um paciente e sai
        depois de uma consulta.
      </DemoNotice>

      {requests.length > 0 && (
        <section aria-label="Pedidos de nova receita" className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-ink">Pedidos dos pacientes</h2>
          <ul className="space-y-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{patientName(r.patientId)}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.nome}
                    {r.note ? ` · ${r.note}` : ""}
                  </p>
                </div>
                <Button
                  className="min-h-11"
                  aria-label={`Atender pedido de ${patientName(r.patientId)}: ${r.nome}`}
                  onClick={() => openFromRequest(r.patientId, r.nome, r.id)}
                >
                  Atender
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-2" role="group" aria-label="Filtro">
        {(
          [
            ["attention", "Precisam de atenção"],
            ["all", "Todas"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-medium",
              filter === id
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-border bg-card text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {groups.length === 0 && (
        <p className="text-base text-muted-foreground">Nenhuma receita para mostrar neste filtro.</p>
      )}

      <div className="space-y-8">
        {groups.map(({ patient, shown }) => (
          <section key={patient.id} aria-label={patient.name} className="space-y-3">
            <h2 className="text-xl font-semibold text-brand-ink">{patient.name}</h2>
            <ul className="space-y-3">
              {shown.map((p) => {
                const state = lifecycle(p, today);
                const chip = LIFECYCLE_CHIP[state];
                const isLatest = latestIds.has(p.id);
                return (
                  <li
                    key={p.id}
                    className={cn(
                      "space-y-2 rounded-2xl border border-border bg-card p-4",
                      !isLatest && "opacity-70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-foreground">{p.nome}</h3>
                        <p className="text-sm text-muted-foreground">{p.dosagem}</p>
                      </div>
                      <span
                        className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", chip.className)}
                      >
                        {chip.text}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={cn("rounded-full px-3 py-1 text-xs font-medium", KIND_INFO[p.kind].chip)}
                      >
                        {KIND_INFO[p.kind].label} · {KIND_INFO[p.kind].paper}
                      </span>
                      <span>Consulta de {formatDateBR(p.consultationDate)}</span>
                      <span>
                        Use de {formatDateBR(p.useFrom)} a {formatDateBR(p.useUntil)}
                      </span>
                    </div>
                    {p.changeNote && <p className="text-sm text-muted-foreground">{p.changeNote}</p>}
                    {isLatest && state !== "stopped" && (
                      <Button
                        className="min-h-11"
                        variant={attentionIds.has(p.id) ? "default" : "outline"}
                        aria-label={`Nova receita de ${p.nome} para ${patient.name}`}
                        onClick={() => setOpening({ last: p })}
                      >
                        Nova receita
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {opening && (
        <NewPrescriptionDialog
          patientName={patientName(opening.last.patientId)}
          last={opening.last}
          initial={draftFrom(opening.last, today)}
          onClose={() => setOpening(null)}
          onIssue={(draft: PrescriptionDraft, change, note) => {
            issue({ draft, change, changeNote: note, requestId: opening.requestId });
            setOpening(null);
          }}
          onStop={(note) => {
            stop(opening.last, note, opening.requestId);
            setOpening(null);
          }}
        />
      )}
    </Page>
  );
}
