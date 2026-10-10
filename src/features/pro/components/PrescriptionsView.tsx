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
  KIND_INFO,
  latestPerMedicine,
  lifecycle,
  needsAttention,
  type Lifecycle,
} from "../prescriptionRules";
import type { Prescription, PrescriptionRequest } from "../types";
import { NewPrescriptionDialog } from "./NewPrescriptionDialog";

const LIFECYCLE_CHIP: Record<Lifecycle, { text: string; className: string }> = {
  ready: { text: "Pronta", className: "bg-brand-100 text-brand-ink" },
  expired: { text: "Vencida", className: "bg-sun-200 text-ink" },
  stopped: { text: "Suspensa", className: "bg-sunken text-muted-foreground" },
};

const NO_REASONS = ["Ainda tem receita válida", "Vamos conversar na consulta"];

type Filter = "attention" | "all";

interface Opening {
  last: Prescription;
  request?: PrescriptionRequest;
}

export default function PrescriptionsView() {
  const {
    today,
    prescriptions,
    pendingRequests,
    lastOf,
    consultationsFor,
    register,
    stop,
    answerRequest,
    patientName,
  } = usePrescriptions();
  const [filter, setFilter] = useState<Filter>("attention");
  const [opening, setOpening] = useState<Opening | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);

  const latest = latestPerMedicine(prescriptions);
  const latestIds = new Set(latest.map((p) => p.id));
  const attentionIds = new Set(latest.filter((p) => needsAttention(p, today)).map((p) => p.id));

  const groups = PATIENTS.map((patient) => {
    const all = prescriptions
      .filter((p) => p.patientId === patient.id)
      .sort((a, b) => b.preparedAt.localeCompare(a.preparedAt));
    const shown = filter === "all" ? all : all.filter((p) => attentionIds.has(p.id));
    return { patient, shown };
  }).filter((g) => g.shown.length > 0);

  const toAttend = pendingRequests.length + attentionIds.size;

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
        O app não emite nem envia receita: você a entrega em mãos e aqui só registra o que preparou. Nada é
        enviado de verdade.
      </DemoNotice>

      {pendingRequests.length > 0 && (
        <section aria-label="Pedidos de nova receita" className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-ink">Pedidos dos pacientes</h2>
          <ul className="space-y-2">
            {pendingRequests.map((r) => {
              const last = lastOf(r.patientId, r.nome);
              return (
                <li key={r.id} className="space-y-3 rounded-2xl border border-border bg-card p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{patientName(r.patientId)}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.nome}
                      {r.note ? ` · ${r.note}` : ""}
                      {last ? ` · ${KIND_INFO[last.kind].label} (${KIND_INFO[last.kind].paper})` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {last && (
                      <Button
                        className="min-h-11"
                        aria-label={`Deixei pronta: ${patientName(r.patientId)}, ${r.nome}`}
                        onClick={() => setOpening({ last, request: r })}
                      >
                        Deixei pronta
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="min-h-11"
                      aria-label={`Precisa de consulta: ${patientName(r.patientId)}, ${r.nome}`}
                      onClick={() => answerRequest(r, "consult")}
                    >
                      Precisa de consulta
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-11"
                      aria-expanded={declining === r.id}
                      aria-label={`Não por agora: ${patientName(r.patientId)}, ${r.nome}`}
                      onClick={() => setDeclining(declining === r.id ? null : r.id)}
                    >
                      Não por agora
                    </Button>
                  </div>
                  {declining === r.id && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Motivo (opcional)">
                      {[...NO_REASONS, ""].map((reason) => (
                        <button
                          key={reason || "none"}
                          type="button"
                          onClick={() => {
                            answerRequest(r, "no", reason || undefined);
                            setDeclining(null);
                          }}
                          className="min-h-11 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground"
                        >
                          {reason || "Sem motivo"}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
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
                      <span>Registrada em {formatDateBR(p.preparedAt)}</span>
                      <span>
                        Use de {formatDateBR(p.useFrom)} a {formatDateBR(p.useUntil)}
                      </span>
                    </div>
                    {p.changeNote && <p className="text-sm text-muted-foreground">{p.changeNote}</p>}
                    {isLatest && state !== "stopped" && (
                      <Button
                        className="min-h-11"
                        variant={attentionIds.has(p.id) ? "default" : "outline"}
                        aria-label={`Registrar nova receita de ${p.nome} para ${patient.name}`}
                        onClick={() => setOpening({ last: p })}
                      >
                        Registrar nova receita
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
          today={today}
          last={opening.last}
          request={opening.request}
          consultations={consultationsFor(opening.last)}
          onClose={() => setOpening(null)}
          onRegister={(draft, origin, change, note) => {
            register({ draft, origin, change, changeNote: note });
            setOpening(null);
          }}
          onStop={(note) => {
            stop(opening.last, note, opening.request?.id);
            setOpening(null);
          }}
        />
      )}
    </Page>
  );
}
