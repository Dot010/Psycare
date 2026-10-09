"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { usePrescriptions } from "@/features/pro/hooks/usePrescriptions";
import { KIND_INFO, latestPerMedicine, lifecycle, requestStage } from "@/features/pro/prescriptionRules";
import type { Prescription } from "@/features/pro/types";
import { daysUntil } from "@/features/pro/prescriptions";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MedicineSheet } from "./MedicineSheet";

const h2 = "text-2xl font-semibold text-brand-ink";

function validityText(p: Prescription, today: string): { text: string; className: string } {
  const state = lifecycle(p, today);
  if (state === "stopped")
    return { text: "Suspenso pelo médico", className: "bg-sunken text-muted-foreground" };
  const left = daysUntil(p.useUntil, today);
  if (state === "expired") return { text: "Vencida", className: "bg-sun-200 text-ink" };
  if (left <= 5) {
    const text = left === 0 ? "Vence hoje" : `Vence em ${left} ${left === 1 ? "dia" : "dias"}`;
    return { text, className: "bg-sun-100 text-ink" };
  }
  return { text: "Em dia", className: "bg-brand-100 text-brand-ink" };
}

/**
 * As receitas do paciente. O app não envia receita: o psiquiatra entrega o papel em mãos. Aqui o paciente
 * pede uma nova, vê quando ficou pronta e marca, só para si, se retirou e se comprou.
 */
export function PrescriptionsSection() {
  const { today, prescriptions, allRequests, notices, steps, requestNew, cancelRequest, advanceStep } =
    usePrescriptions();
  const [sheet, setSheet] = useState<Prescription | null>(null);

  const mine = latestPerMedicine(prescriptions.filter((p) => p.patientId === LIVE_PATIENT_ID)).sort((a, b) =>
    a.nome.localeCompare(b.nome),
  );
  const myRequests = allRequests.filter((r) => r.patientId === LIVE_PATIENT_ID);
  const myNotices = notices.filter((n) => n.patientId === LIVE_PATIENT_ID).slice(0, 3);

  return (
    <section aria-labelledby="rx-title" className="space-y-4 border-t border-border pt-8">
      <h2 id="rx-title" className={h2}>
        Minhas receitas
      </h2>
      <p className="text-sm text-muted-foreground">
        A receita é entregue pelo seu psiquiatra, em mãos. Aqui você pede uma nova e acompanha o prazo.
      </p>

      {myNotices.length > 0 && (
        <ul aria-label="Avisos" className="space-y-2">
          {myNotices.map((n) => (
            <li key={n.id} className="rounded-xl bg-sun-100 px-4 py-3 text-sm text-ink">
              {n.text}
            </li>
          ))}
        </ul>
      )}

      {mine.length === 0 && (
        <p className="text-base text-muted-foreground">Nenhuma receita registrada ainda.</p>
      )}

      <ul className="space-y-3">
        {mine.map((p) => {
          const state = lifecycle(p, today);
          const validity = validityText(p, today);
          const request = myRequests
            .filter(
              (r) =>
                r.nome.trim().toLowerCase() === p.nome.trim().toLowerCase() && r.requestedAt >= p.preparedAt,
            )
            .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
          const stage = request ? requestStage(request) : undefined;
          const step = steps[p.id];
          return (
            <li key={p.id} className="space-y-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">{p.nome}</h3>
                  <p className="text-sm text-muted-foreground">{p.dosagem}</p>
                </div>
                <span
                  className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", validity.className)}
                >
                  {validity.text}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium", KIND_INFO[p.kind].chip)}>
                  {KIND_INFO[p.kind].label} · {KIND_INFO[p.kind].paper}
                </span>
                {state !== "stopped" && (
                  <span>
                    Use de {formatDateBR(p.useFrom)} a {formatDateBR(p.useUntil)}
                  </span>
                )}
              </div>

              {state !== "stopped" && (
                <div className="space-y-1">
                  {step === "comprei" ? (
                    <p className="text-sm font-medium text-brand-ink">Tudo certo: você já tem o remédio.</p>
                  ) : (
                    <Button variant="outline" className="min-h-11" onClick={() => advanceStep(p.id)}>
                      {step === "retirei" ? "Já comprei o remédio" : "Já retirei a receita"}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">Só você vê isto. Seu médico não sabe.</p>
                </div>
              )}

              {state !== "stopped" && stage === undefined && (
                <Button className="min-h-11" onClick={() => requestNew(LIVE_PATIENT_ID, p.nome)}>
                  Pedir nova receita
                </Button>
              )}
              {request && stage === "sent" && (
                <div className="space-y-2">
                  <p role="status" className="text-sm text-foreground">
                    Pedido enviado. Aguardando o seu psiquiatra.
                  </p>
                  <Button variant="outline" className="min-h-11" onClick={() => cancelRequest(request.id)}>
                    Cancelar pedido
                  </Button>
                </div>
              )}
              {request && stage === "consult" && (
                <p className="text-sm text-foreground">
                  Seu psiquiatra pede uma consulta antes.{" "}
                  <Link href="/dashboard/appointments" className="font-medium text-brand-ink underline">
                    Marcar consulta
                  </Link>
                </p>
              )}
              {request && stage === "no" && (
                <p className="text-sm text-foreground">
                  Seu psiquiatra não fará a receita por agora.
                  {request.answer?.reason
                    ? ` ${request.answer.reason}.`
                    : " Vamos conversar na próxima consulta."}
                </p>
              )}

              <Button variant="ghost" className="min-h-11 px-0" onClick={() => setSheet(p)}>
                Ver ficha do remédio
              </Button>
            </li>
          );
        })}
      </ul>

      {sheet && (
        <MedicineSheet
          nome={sheet.nome}
          dosagem={sheet.dosagem}
          kind={sheet.kind}
          onClose={() => setSheet(null)}
        />
      )}
    </section>
  );
}
