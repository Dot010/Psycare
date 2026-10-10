"use client";

import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/format";
import { useReferrals } from "../hooks/useReferrals";
import { canRequest, REMINDER_OPTIONS, STAGE_LABEL, stageOf } from "../logic";

/** Para a psicóloga: em que etapa está o encaminhamento do paciente, com lembrete gentil e sugestão. */
export function ProReferralBox({ patientId, firstName }: { patientId: string; firstName: string }) {
  const rf = useReferrals();
  const current = rf.currentFor(patientId);
  const stage = current ? stageOf(current) : undefined;
  const suggested = rf.suggested[patientId];

  return (
    <div className="space-y-3">
      {!current || stage === "delivered" ? (
        <>
          {stage === "delivered" && current ? (
            <p className="text-base text-foreground">
              Recebido em {formatDateBR(current.deliveredAt as string)}: {current.insurance},{" "}
              {current.sessions} sessões autorizadas.
            </p>
          ) : (
            <p className="text-base text-muted-foreground">
              {firstName} não tem encaminhamento em andamento.
            </p>
          )}
          {canRequest(rf.referrals, patientId) &&
            (suggested ? (
              <p className="text-sm text-muted-foreground">Você sugeriu em {formatDateBR(suggested)}.</p>
            ) : (
              <Button variant="outline" className="min-h-11" onClick={() => rf.suggest(patientId)}>
                Sugerir que peça um encaminhamento
              </Button>
            ))}
        </>
      ) : (
        <>
          <p className="text-base text-foreground">
            Etapa: <strong>{STAGE_LABEL[stage as keyof typeof STAGE_LABEL]}</strong>
            {stage === "authorized" && current.insurance
              ? ` · ${current.insurance}, ${current.sessions} sessões`
              : ""}
          </p>
          {current.reminders[0] && (
            <p className="text-sm text-muted-foreground">
              Último lembrete em {formatDateBR(current.reminders[0].at)}.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((text, i) => (
              <Button
                key={i}
                variant="outline"
                className="min-h-11"
                onClick={() => rf.remind(current.id, text)}
              >
                {i === 0 ? "Lembrete: levar ao convênio" : "Lembrete: entregar a mim"}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
