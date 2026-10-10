"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LIVE_PATIENT_ID } from "@/features/pro/data";
import { formatDateBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useReferrals } from "../hooks/useReferrals";
import { canRequest, parseAuthorization, STAGE_LABEL, STAGES, stageOf } from "../logic";

const field = "h-11 w-full rounded-xl border border-border bg-card px-3 text-base";

/** "Meu encaminhamento" em Saúde: o paciente pede e anota cada etapa. O papel em si é entregue em mãos. */
export function ReferralSection() {
  const rf = useReferrals();
  const current = rf.currentFor(LIVE_PATIENT_ID);
  const stage = current ? stageOf(current) : undefined;
  const suggestedOn = rf.suggested[LIVE_PATIENT_ID];
  const [insurance, setInsurance] = useState("");
  const [sessions, setSessions] = useState("");
  const [error, setError] = useState("");

  const sendAuthorization = () => {
    const parsed = parseAuthorization(insurance, sessions);
    if (!parsed || !current) {
      setError("Informe o convênio e o número de sessões (de 1 a 60).");
      return;
    }
    setError("");
    rf.authorize(current.id, parsed.insurance, parsed.sessions);
  };

  return (
    <section
      id="encaminhamento"
      aria-labelledby="enc-title"
      className="space-y-4 border-t border-border pt-8"
    >
      <h2 id="enc-title" className="text-2xl font-semibold text-brand-ink">
        Meu encaminhamento
      </h2>
      <p className="text-sm text-muted-foreground">
        O encaminhamento para a psicóloga é um papel que o seu psiquiatra entrega em mãos. Aqui você pede e
        anota cada etapa.
      </p>

      {suggestedOn && canRequest(rf.referrals, LIVE_PATIENT_ID) && (
        <p role="status" className="rounded-xl bg-sun-100 px-4 py-3 text-sm text-ink">
          Sua psicóloga sugeriu pedir um encaminhamento ao seu psiquiatra. Sem pressa.
        </p>
      )}

      {current && (
        <ol aria-label="Etapas do encaminhamento" className="space-y-2">
          {STAGES.map((s, i) => {
            const reached = STAGES.indexOf(stage as (typeof STAGES)[number]) >= i;
            return (
              <li
                key={s}
                aria-current={s === stage ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 text-base",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border text-xs",
                    reached ? "border-brand-600 bg-brand-600 text-white" : "border-border",
                  )}
                >
                  {reached ? "✓" : i + 1}
                </span>
                {STAGE_LABEL[s]}
              </li>
            );
          })}
        </ol>
      )}

      {current && current.reminders.length > 0 && (
        <p className="rounded-xl bg-brand-100 px-4 py-3 text-sm text-brand-ink">
          Recado da sua psicóloga: {current.reminders[0].text}
        </p>
      )}

      {(!current || stage === "delivered") && (
        <div className="space-y-2">
          {stage === "delivered" && current && (
            <p className="text-sm text-foreground">
              Entregue em {formatDateBR(current.deliveredAt as string)}. {current.insurance},{" "}
              {current.sessions} sessões autorizadas.
            </p>
          )}
          <Button className="min-h-11" onClick={() => rf.request(LIVE_PATIENT_ID)}>
            Pedir encaminhamento
          </Button>
        </div>
      )}

      {current && stage === "requested" && (
        <div className="space-y-2">
          <p role="status" className="text-sm text-foreground">
            Pedido enviado. Aguardando o seu psiquiatra.
          </p>
          <Button variant="outline" className="min-h-11" onClick={() => rf.cancel(current.id)}>
            Cancelar pedido
          </Button>
        </div>
      )}

      {current && stage === "issued" && (
        <div className="space-y-3">
          <p className="text-sm text-foreground">
            Seu psiquiatra deixou o encaminhamento pronto. Retire o papel com ele e leve ao convênio.
          </p>
          <div className="space-y-1">
            <label htmlFor="enc-conv" className="text-sm font-medium text-foreground">
              Nome do convênio
            </label>
            <input
              id="enc-conv"
              className={field}
              value={insurance}
              maxLength={60}
              onChange={(e) => setInsurance(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="enc-sess" className="text-sm font-medium text-foreground">
              Sessões autorizadas
            </label>
            <input
              id="enc-sess"
              type="number"
              min={1}
              max={60}
              inputMode="numeric"
              className={field}
              value={sessions}
              onChange={(e) => setSessions(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-danger-600">
              {error}
            </p>
          )}
          <Button className="min-h-11" onClick={sendAuthorization}>
            O convênio autorizou
          </Button>
        </div>
      )}

      {current && stage === "authorized" && (
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            Autorizado por {current.insurance}: {current.sessions} sessões. Falta levar o papel à sua
            psicóloga.
          </p>
          <Button className="min-h-11" onClick={() => rf.deliver(current.id)}>
            Já entreguei à psicóloga
          </Button>
        </div>
      )}
    </section>
  );
}
